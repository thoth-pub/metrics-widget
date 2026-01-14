import type { ToEntity } from '../interfaces/BaseMapper';
import type { WorkDto, WorkEntity } from '../interfaces/Works';
import { normalizeDoi } from '../utils';

export class WorkMapper implements ToEntity<WorkEntity, WorkDto> {
	toEntity(dto: WorkDto): WorkEntity {
		const { relations = [], title, workType, doi } = dto;

		const ordinal = relations.length > 0 ? relations[0]?.relationOrdinal : 0;
		const normalizedDoi = normalizeDoi(doi);

		return {
			doi: normalizedDoi ?? '',
			title,
			type: workType,
			ordinal: ordinal ?? 0,
		};
	}
}
