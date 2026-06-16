import type { MetaData } from '../interfaces';
import type { ToEntity } from '../interfaces/BaseMapper';
import type { WorkDto } from '../interfaces/Works';
import { normalizeDoi } from '../utils';

export class WorkMapper implements ToEntity<MetaData, WorkDto> {
	toEntity(dto: WorkDto): MetaData {
		const { relations = [], title, workType, doi } = dto;

		return {
			book: {
				doi: normalizeDoi(doi),
				title,
				type: workType,
				ordinal: 0,
			},
			chapters: relations.map(
				({ relationOrdinal, relatedWork: { doi, title, workType } }) => ({
					doi: normalizeDoi(doi),
					title,
					type: workType,
					ordinal: relationOrdinal,
				}),
			),
		};
	}
}
