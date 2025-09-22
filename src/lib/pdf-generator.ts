import jsPDF from "jspdf";
import QRCode from "qrcode";
import type { Team } from "@/contexts/DataContext";
import { env } from "@/env";

export async function generateTeamsPDF(teams: Team[]): Promise<void> {
	const doc = new jsPDF();
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();

	const margin = 10;
	const sectionHeight = (pageHeight - 3 * margin) / 2;
	const qrSize = 50;
	const websiteUrl = env.NEXT_PUBLIC_WEBSITE_URL;

	let currentSection = 0;

	for (let i = 0; i < teams.length; i++) {
		const team = teams[i];

		if (!team) continue;

		for (let copy = 0; copy < 2; copy++) {
			if (currentSection >= 2) {
				doc.addPage();
				currentSection = 0;
			}

			const sectionY = margin + currentSection * (sectionHeight + margin);

			try {
				const qrDataUrl = await QRCode.toDataURL(websiteUrl, {
					width: 200,
					margin: 1,
					color: {
						dark: "#000000",
						light: "#FFFFFF",
					},
				});

				await drawTeamSection(
					doc,
					team,
					qrDataUrl,
					margin,
					sectionY,
					pageWidth - 2 * margin,
					sectionHeight,
					qrSize,
				);
			} catch (error) {
				console.error("Error generating QR code for team:", team.name, error);
				await drawTeamSection(
					doc,
					team,
					null,
					margin,
					sectionY,
					pageWidth - 2 * margin,
					sectionHeight,
					qrSize,
				);
			}

			currentSection++;
		}
	}

	const fileName = `teams-qr-codes-${new Date().toISOString().split("T")[0]}.pdf`;
	doc.save(fileName);
}

export async function generateEventTeamsPDF(
	teams: Team[],
	eventName: string,
): Promise<void> {
	const doc = new jsPDF();
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();

	const margin = 20;
	const sectionHeight = (pageHeight - 3 * margin) / 2; // Two sections per page
	const qrSize = 50;
	const websiteUrl = env.NEXT_PUBLIC_WEBSITE_URL;

	let currentSection = 0;

	for (let i = 0; i < teams.length; i++) {
		const team = teams[i];

		if (!team) continue; // Skip if team is undefined

		// Create two copies of each team on the same page
		for (let copy = 0; copy < 2; copy++) {
			// Check if we need a new page (after every 2 sections)
			if (currentSection >= 2) {
				doc.addPage();
				currentSection = 0;
			}

			// Calculate Y position for current section
			const sectionY = margin + currentSection * (sectionHeight + margin);

			// Generate QR code for the website URL
			try {
				const qrDataUrl = await QRCode.toDataURL(websiteUrl, {
					width: 200,
					margin: 1,
					color: {
						dark: "#000000",
						light: "#FFFFFF",
					},
				});

				// Draw the team section
				await drawTeamSection(
					doc,
					team,
					qrDataUrl,
					margin,
					sectionY,
					pageWidth - 2 * margin,
					sectionHeight,
					qrSize,
				);
			} catch (error) {
				console.error("Error generating QR code for team:", team.name, error);
				// Continue without QR code if generation fails
				await drawTeamSection(
					doc,
					team,
					null,
					margin,
					sectionY,
					pageWidth - 2 * margin,
					sectionHeight,
					qrSize,
				);
			}

			currentSection++;
		}
	}

	// Save the PDF with event name
	const fileName = `${eventName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-teams-qr-codes-${new Date().toISOString().split("T")[0]}.pdf`;
	doc.save(fileName);
}

async function drawTeamSection(
	doc: jsPDF,
	team: Team,
	qrDataUrl: string | null,
	x: number,
	y: number,
	width: number,
	height: number,
	qrSize: number,
): Promise<void> {
	// Draw border around the section
	doc.setDrawColor(0, 0, 0);
	doc.setLineWidth(0.5);
	doc.rect(x, y, width, height);

	// Calculate center positions for vertical layout
	const centerX = x + width / 2;
	const startY = y + 15;
	const lineHeight = 10; // Reduced line height

	// Calculate QR code position first to ensure text doesn't overlap
	const qrX = centerX - qrSize / 2;
	const qrY = y + height - qrSize - 10; // Reduced bottom margin
	const textEndY = qrY - 5; // Text should end 5px before QR code

	let currentY = startY;

	// Team ID (bold and larger) - label and value on same line
	doc.setFontSize(14);
	doc.setFont("helvetica", "bold");
	doc.text(`Team ID: ${team.id}`, centerX, currentY, { align: "center" });
	currentY += lineHeight + 2;

	// Team Name - label and value on same line
	doc.setFontSize(12);
	doc.setFont("helvetica", "normal");
	doc.text(`Team Name: ${team.name}`, centerX, currentY, { align: "center" });
	currentY += lineHeight;

	doc.text(`Username: ${team.username}`, centerX, currentY, {
		align: "center",
	});
	currentY += lineHeight;

	// Website URL (only if there's space) - label and value on same line
	if (currentY + lineHeight < textEndY) {
		doc.setFontSize(10);
		doc.text(`Website: ${env.NEXT_PUBLIC_WEBSITE_URL}`, centerX, currentY, {
			align: "center",
		});
	}

	// Add QR code at the bottom
	if (qrDataUrl) {
		try {
			doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

			// Add label for QR code
			doc.setFontSize(8);
			doc.setFont("helvetica", "italic");
			doc.text("Scan to visit website", centerX, qrY + qrSize + 5, {
				align: "center",
			});
		} catch (error) {
			console.error("Error adding QR code to PDF:", error);
			// Add placeholder text if QR code fails
			doc.setFontSize(10);
			doc.text("QR Code unavailable", centerX, qrY + qrSize / 2, {
				align: "center",
			});
		}
	} else {
		// Add placeholder if no QR code
		doc.setFontSize(10);
		doc.text("QR Code unavailable", centerX, qrY + qrSize / 2, {
			align: "center",
		});
	}
}
