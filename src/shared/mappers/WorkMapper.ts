import type { MetaData } from '../interfaces';
import type { ToEntity } from '../interfaces/BaseMapper';
import type { WorkDto } from '../interfaces/Works';

export class WorkMapper implements ToEntity<MetaData, WorkDto> {
	toEntity(dto: WorkDto): MetaData {
		const { relations = [], title, workType, doi } = dto;

		return {
			book: {
				doi,
				title,
				type: workType,
				ordinal: 0,
			},
			chapters: relations.map(
				({ relationOrdinal, relatedWork: { doi, title, workType } }) => ({
					doi,
					title,
					type: workType,
					ordinal: relationOrdinal,
				}),
			),
		};
	}
}
