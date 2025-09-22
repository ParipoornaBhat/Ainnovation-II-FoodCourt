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

export interface TeamOrder {
	id: number;
	teamId: string;
	eventId: string;
	totalAmount: number;
	orderStatus: string;
	paymentStatus: string;
	placedAt: Date;
	items: Array<{
		id: string;
		quantity: number;
		priceAtOrder: number;
		foodItem: {
			id: string;
			name: string;
			imageUrl?: string | null;
			price: number;
		};
	}>;
	event: {
		id: string;
		name: string;
	};
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

	// Team order management
	teamOrders: TeamOrder[];
	teamOrdersLoading: boolean;
	refreshTeamOrders: (teamId?: string) => Promise<void>;
	getCurrentTeamOrders: (teamId: string) => TeamOrder[];

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

	// Order management
	createOrder: (data: {
		teamId: string;
		eventId: string;
		items: Array<{
			foodItemId: string;
			quantity: number;
			priceAtOrder: number;
		}>;
	}) => Promise<void>;
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
	const [teamOrders, setTeamOrders] = useState<TeamOrder[]>([]);
	const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);

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

	// Team order queries - only fetch when we have a current team
	const {
		data: teamOrdersData,
		isLoading: teamOrdersLoading,
		refetch: refetchTeamOrdersRefetch,
	} = api.teams.getTeamOrderHistory.useQuery(
		{ teamId: currentTeamId || "" },
		{ enabled: !!currentTeamId },
	);

	// Team mutations
	const createTeamMutation = api.teams.createTeam.useMutation();
	const updateTeamMutation = api.teams.updateTeam.useMutation();
	const deleteTeamMutation = api.teams.deleteTeam.useMutation();

	// Order mutations
	const createOrderMutation = api.orders.createOrder.useMutation();

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

	useEffect(() => {
		if (teamOrdersData) {
			setTeamOrders(teamOrdersData);
		}
	}, [teamOrdersData]);

	const refreshEvents = async () => {
		await refetchEvents();
	};

	const refreshTeams = async () => {
		await refetchTeams();
	};

	const refreshFoodItems = async () => {
		await refetchFoodItems();
	};

	const refreshTeamOrders = async (teamId?: string) => {
		if (teamId && teamId !== currentTeamId) {
			setCurrentTeamId(teamId);
		}
		if (currentTeamId || teamId) {
			await refetchTeamOrdersRefetch();
		}
	};

	const getCurrentTeamOrders = (teamId: string): TeamOrder[] => {
		if (teamId === currentTeamId) {
			return teamOrders;
		}
		return [];
	};

	const refreshAll = async () => {
		await Promise.all([refetchEvents(), refetchTeams(), refetchFoodItems()]);
		if (currentTeamId) {
			await refreshTeamOrders();
		}
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

	const createOrder = async (data: {
		teamId: string;
		eventId: string;
		items: Array<{
			foodItemId: string;
			quantity: number;
			priceAtOrder: number;
		}>;
	}) => {
		await createOrderMutation.mutateAsync(data);
		// Refresh team orders and food items after creating order
		await refreshTeamOrders(data.teamId);
		await refreshFoodItems(); // To update quantities
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

		// Team order management
		teamOrders,
		teamOrdersLoading,
		refreshTeamOrders,
		getCurrentTeamOrders,

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

		// Order management
		createOrder,
	};

	return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
