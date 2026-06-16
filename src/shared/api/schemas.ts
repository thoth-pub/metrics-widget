import { gql } from 'graphql-request';

export const GET_WORK_WITH_CHAPTERS_QUERY = gql`
  query GetWorkWithChapters($doi: Doi!) {
    workByDoi(doi: $doi) {
      doi
      title
      workType
      relations(
        relationTypes: HAS_CHILD
        order: {field: RELATION_ORDINAL, direction: ASC}
      ) {
        relationOrdinal
        relatedWork {
          doi
          title
          workType
        }
      }
    }
  }
`;
