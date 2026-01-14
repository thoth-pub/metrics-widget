import { gql } from 'graphql-request';

export const GET_BOOKS_COUNT_QUERY = gql`
  query GetBooksCount($filter: String!) {
    workCount(filter: $filter, workStatuses: [ACTIVE, WITHDRAWN, SUPERSEDED])
  }
`;

export const GET_BOOK_QUERY = gql`
  query GetBook($filter: String!) {
    works(filter: $filter, workTypes: [BOOK_SET, EDITED_BOOK, JOURNAL_ISSUE, MONOGRAPH, TEXTBOOK], workStatuses: [ACTIVE, WITHDRAWN, SUPERSEDED]) {
      doi
      title
      workType
    }
  }
`;

export const GET_CHAPTERS_QUERY = gql`
  query GetBooks($filter: String!, $offset: Int!, $limit: Int!) {
    chapters(filter: $filter, offset: $offset, limit: $limit, workStatuses: [ACTIVE, WITHDRAWN, SUPERSEDED]) {
      doi
      title
      workType
      relations(order: {field: RELATION_ORDINAL, direction: ASC}) {
        relationOrdinal
      }
    }
  }
`;
