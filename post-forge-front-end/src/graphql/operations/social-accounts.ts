import { gql } from '@apollo/client';

export const SOCIAL_ACCOUNT_FRAGMENT = gql`
  fragment SocialAccountFields on SocialAccount {
    id
    workspaceId
    platform
    platformUserId
    metadata
    needsReconnect
    createdAt
    updatedAt
  }
`;

export const GET_SOCIAL_ACCOUNTS = gql`
  query GetSocialAccounts {
    socialAccounts {
      ...SocialAccountFields
    }
  }
  ${SOCIAL_ACCOUNT_FRAGMENT}
`;

export const DISCONNECT_SOCIAL_ACCOUNT = gql`
  mutation DisconnectSocialAccount($id: ID!) {
    disconnectSocialAccount(id: $id)
  }
`;
