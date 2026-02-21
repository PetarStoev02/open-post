<?php

declare(strict_types=1);

namespace App\SocialAccounts\UseCases;

use App\SocialAccounts\Entities\Models\SocialAccount;
use App\SocialAccounts\UseCases\Contracts\SocialAccountRepository;

final readonly class ConnectOrUpdateSocialAccountInteractor
{
    public function __construct(
        private SocialAccountRepository $socialAccountRepository,
    ) {}

    /**
     * Connect or update a social account with OAuth tokens.
     */
    public function execute(
        string $workspaceId,
        string $platform,
        string $platformUserId,
        string $accessToken,
        ?string $refreshToken = null,
        ?\DateTimeInterface $tokenExpiresAt = null,
        ?array $metadata = null
    ): SocialAccount {
        return $this->socialAccountRepository->createOrUpdate(
            workspaceId: $workspaceId,
            platform: $platform,
            platformUserId: $platformUserId,
            accessToken: $accessToken,
            refreshToken: $refreshToken,
            tokenExpiresAt: $tokenExpiresAt,
            metadata: $metadata
        );
    }
}
