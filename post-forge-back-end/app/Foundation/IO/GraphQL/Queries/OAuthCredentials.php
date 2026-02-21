<?php

declare(strict_types=1);

namespace App\Foundation\IO\GraphQL\Queries;

use App\Foundation\Settings\OAuthCredentialsSettings;

final readonly class OAuthCredentials
{
    private const PROVIDERS = ['facebook', 'x', 'linkedin-openid', 'instagram', 'threads'];

    public function __construct(
        private OAuthCredentialsSettings $oauthCredentials,
    ) {}

    /**
     * @return list<array{provider: string, clientIdSet: bool, clientIdMasked: string|null, clientSecretSet: bool}>
     */
    public function __invoke(): array
    {
        $result = [];
        foreach (self::PROVIDERS as $provider) {
            $result[] = $this->oauthCredentials->getMasked($provider);
        }

        return $result;
    }
}
