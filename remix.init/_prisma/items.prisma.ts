import { type PrismaClient } from "@prisma/client";
import { type Item, type ItemsService } from "~/services";

export class PrismaItemsService implements ItemsService {
	constructor(private client: PrismaClient) {}

	async getAllItems(): Promise<Item[]> {
		const items = await this.client.item.findMany();
		return items.map((item) => ({
			id: item.id,
			label: item.label,
		}));
	}

	async getItemById(id: string): Promise<Item | undefined> {
		const item = await this.client.item.findUnique({
			where: {
				id,
			},
		});
		return item
			? {
					id: item.id,
					label: item.label,
			  }
			: undefined;
	}

	async createItem({ label }: { label: string }): Promise<string> {
		const item = await this.client.item.create({
			data: {
				label,
			},
		});
		return item.id;
	}

	async deleteItemById(id: string): Promise<void> {
		await this.client.item.delete({
			where: {
				id,
			},
		});
	}
}
