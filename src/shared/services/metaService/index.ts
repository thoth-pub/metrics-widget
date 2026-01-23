import {
	config,
	type Doi,
	GET_WORK_WITH_CHAPTERS_QUERY,
	type MetaData,
	type WorkDto,
} from '@/shared';
import { WorkMapper } from '@/shared/mappers';
import request from 'graphql-request';

class MetaService {
	private mapper = new WorkMapper();
	// private async getBooksCount(doi: Doi): Promise<number> {
	// 	const booksCountResponse = await request<{ workCount: number }>(
	// 		config.metaApi.url,
	// 		GET_BOOKS_COUNT_QUERY,
	// 		{ filter: doi },
	// 	);

	// 	return booksCountResponse?.workCount ?? 0;
	// }

	// private async getBook(doi: Doi): Promise<WorkEntity | null> {
	// 	const bookResponse = await request<{ works: WorkDto[] }>(
	// 		config.metaApi.url,
	// 		GET_BOOK_QUERY,
	// 		{ filter: doi },
	// 	);

	// 	if (!bookResponse?.works || bookResponse?.works.length === 0) return null;

	// 	const foundedBook = bookResponse.works[0];

	// 	return this.mapper.toEntity(foundedBook);
	// }

	// private async getChapters(
	// 	doi: Doi,
	// 	chaptersCount = 0,
	// ): Promise<WorkEntity[]> {
	// 	const res: WorkEntity[] = [];
	// 	let offset = 0;
	// 	const limit = config.metaApi.itemsPerRequestLimit;

	// 	do {
	// 		const response = await request<{ chapters: WorkDto[] }>(
	// 			config.metaApi.url,
	// 			GET_CHAPTERS_QUERY,
	// 			{ filter: doi, offset, limit },
	// 		);

	// 		response.chapters.forEach((chapter) => {
	// 			res.push(this.mapper.toEntity(chapter));
	// 		});

	// 		offset += limit;
	// 	} while (offset < chaptersCount);

	// 	return res;
	// }

	public async getMetadata(doi: Doi): Promise<MetaData> {
		const dto = await request<{ workByDoi: WorkDto }>(
			config.metaApi.url,
			GET_WORK_WITH_CHAPTERS_QUERY,
			{ doi: doi },
		);

		const data = this.mapper.toEntity(dto.workByDoi);

		return data;
	}
}

export default MetaService;
