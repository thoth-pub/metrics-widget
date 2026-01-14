import { gql } from 'graphql-request';

export const GET_BOOKS_COUNT_QUERY = gql`
  query GetBooksCount($filter: String!) {
    workCount(filter: $filter)
  }
`;

export const GET_BOOK_QUERY = gql`
  query GetBook($filter: String!) {
    works(filter: $filter, workTypes: [BOOK_SET, EDITED_BOOK, JOURNAL_ISSUE, MONOGRAPH, TEXTBOOK]) {
      doi
      title
      workType
    }
  }
`;

export const GET_CHAPTERS_QUERY = gql`
  query GetBooks($filter: String!, $offset: Int!, $limit: Int!) {
    chapters(filter: $filter, offset: $offset, limit: $limit) {
      doi
      title
      workType
      relations(order: {field: RELATION_ORDINAL, direction: ASC}) {
        relationOrdinal
      }
    }
  }
`;
