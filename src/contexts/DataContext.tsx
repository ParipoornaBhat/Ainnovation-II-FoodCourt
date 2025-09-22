"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type React from "react";
import { api } from "@/trpc/react";

// Better typed interfaces with proper nullable fields and consistent structure
export interface Event {
	id: string;
	name: string;
	description: string | null;
	startDate: Date;
	endDate: Date;
	createdAt: Date;
	adminId: string;
	teams: Array<{
		id: string;
		name: string;
		username: string;
		password: string;
		createdAt: Date;
		eventId: string | null;
	}>;
	inventory: {
		id: string;
		createdAt: Date;
		eventId: string;
		inventoryItems: Array<{
			id: string;
			maxOrderPerTeam: number | null;
			inventoryId: string;
			foodItemId: string;
			createdAt: Date;
		}>;
	} | null;
	_count: {
		orders: number;
		teams: number;
	};
	// Virtual fields calculated from _count
	orderCount: number;
	teamCount: number;
	foodItemCount: number;
}

export interface Team {
	id: string;
	name: string;
	username: string;
	password: string;
	createdAt: Date;
	eventId: string | null; // Allow null to match actual data structure
	event?: {
		id: string;
		name: string;
	} | null;
	orders: Array<{
		id: number;
		totalAmount: number;
		orderStatus: string;
		placedAt: Date;
		items?: Array<{
			id: string;
			quantity: number;
			priceAtOrder: number;
			foodItem: {
				id: string;
				name: string;
				imageUrl?: string | null;
			};
		}>;
	}>;
	_count: {
		orders: number;
	};
}

export interface FoodItem {
	id: string;
	name: string;
	description?: string | null;
	price: number;
	imageUrl?: string | null;
	availableQty: number;
	isActive: boolean;
	restrictions: string[];
	createdAt: Date;
}

interface DataContextType {
	events: Event[];
	eventsLoading: boolean;
	refreshEvents: () => Promise<void>;

	teams: Team[];
	teamsLoading: boolean;
	refreshTeams: () => Promise<void>;

	foodItems: FoodItem[];
	foodItemsLoading: boolean;
	refreshFoodItems: () => Promise<void>;

	refreshAll: () => Promise<void>;

	getEventById: (id: string) => Event | undefined;
	getTeamById: (id: string) => Team | undefined;
	getFoodItemById: (id: string) => FoodItem | undefined;
	getTeamsByEvent: (eventId: string) => Team[];
	getEventsByTeam: (teamId: string) => Event[];

	// Team management functions
	getTeamsByEventWithData: (eventId: string) => Team[];
	getAllTeamsWithData: () => Team[];
	createTeam: (data: {
		name: string;
		username: string;
		password: string;
		eventId: string;
	}) => Promise<void>;
	updateTeam: (
		id: string,
		data: { name?: string; username?: string; password?: string },
	) => Promise<void>;
	deleteTeam: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useAppData = () => {
	const context = useContext(DataContext);
	if (context === undefined) {
		throw new Error("useAppData must be used within a DataProvider");
	}
	return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [events, setEvents] = useState<Event[]>([]);
	const [teams, setTeams] = useState<Team[]>([]);
	const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

	const {
		data: eventsData,
		isLoading: eventsLoading,
		refetch: refetchEvents,
	} = api.events.getAllEvents.useQuery();

	const {
		data: teamsData,
		isLoading: teamsLoading,
		refetch: refetchTeams,
	} = api.teams.getAllTeams.useQuery();

	const {
		data: foodItemsData,
		isLoading: foodItemsLoading,
		refetch: refetchFoodItems,
	} = api.food.getAllFoodItems.useQuery();

	// Team mutations
	const createTeamMutation = api.teams.createTeam.useMutation();
	const updateTeamMutation = api.teams.updateTeam.useMutation();
	const deleteTeamMutation = api.teams.deleteTeam.useMutation();

	useEffect(() => {
		if (eventsData) {
			setEvents(eventsData);
		}
	}, [eventsData]);

	useEffect(() => {
		if (teamsData) {
			setTeams(teamsData);
		}
	}, [teamsData]);

	useEffect(() => {
		if (foodItemsData) {
			setFoodItems(foodItemsData);
		}
	}, [foodItemsData]);

	const refreshEvents = async () => {
		await refetchEvents();
	};

	const refreshTeams = async () => {
		await refetchTeams();
	};

	const refreshFoodItems = async () => {
		await refetchFoodItems();
	};

	const refreshAll = async () => {
		await Promise.all([refetchEvents(), refetchTeams(), refetchFoodItems()]);
	};

	const getEventById = (id: string) => {
		return events.find((event) => event.id === id);
	};

	const getTeamById = (id: string) => {
		return teams.find((team) => team.id === id);
	};

	const getFoodItemById = (id: string) => {
		return foodItems.find((item) => item.id === id);
	};

	const getTeamsByEvent = (eventId: string) => {
		return teams.filter((team) => team.eventId === eventId);
	};

	const getEventsByTeam = (teamId: string) => {
		const team = teams.find((t) => t.id === teamId);
		if (!team) return [];

		const event = events.find((e) => e.id === team.eventId);
		return event ? [event] : [];
	};

	// New team management functions
	const getTeamsByEventWithData = (eventId: string): Team[] => {
		return teams.filter((team) => team.eventId === eventId);
	};

	const getAllTeamsWithData = (): Team[] => {
		return teams;
	};

	const createTeam = async (data: {
		name: string;
		username: string;
		password: string;
		eventId: string;
	}) => {
		await createTeamMutation.mutateAsync(data);
		await refetchTeams();
	};

	const updateTeam = async (
		id: string,
		data: { name?: string; username?: string; password?: string },
	) => {
		await updateTeamMutation.mutateAsync({ id, ...data });
		await refetchTeams();
	};

	const deleteTeam = async (id: string) => {
		await deleteTeamMutation.mutateAsync({ id });
		await refetchTeams();
	};

	const value: DataContextType = {
		events,
		eventsLoading,
		refreshEvents,

		teams,
		teamsLoading,
		refreshTeams,

		foodItems,
		foodItemsLoading,
		refreshFoodItems,

		refreshAll,

		getEventById,
		getTeamById,
		getFoodItemById,
		getTeamsByEvent,
		getEventsByTeam,

		// Team management functions
		getTeamsByEventWithData,
		getAllTeamsWithData,
		createTeam,
		updateTeam,
		deleteTeam,
	};

	return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
