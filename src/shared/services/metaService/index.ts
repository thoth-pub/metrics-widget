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
