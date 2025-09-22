import { db } from "@/server/db";

const main = async () => {
	// let count = 1;
	// const teams = await db.team.findMany({
	// 	orderBy: {
	// 		username: "asc",
	// 	},
	// });
	// for (const team of teams) {
	// 	await db.team.update({
	// 		where: { id: team.id },
	// 		data: {
	// 			teamId: count++,
	// 		},
	// 	});
	// }
    await db.$executeRaw`TRUNCATE TABLE "Team" RESTART IDENTITY CASCADE;`;
};

main()
	.then(() => {
		console.log("Team IDs assigned successfully.");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Error assigning Team IDs:", error);
		process.exit(1);
	});
