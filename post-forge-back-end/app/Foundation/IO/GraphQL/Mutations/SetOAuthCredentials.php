<?php

declare(strict_types=1);

namespace App\Foundation\IO\GraphQL\Mutations;

use App\Foundation\Settings\OAuthCredentialsSettings;

final readonly class SetOAuthCredentials
{
    private const ALLOWED_PROVIDERS = ['facebook', 'x', 'linkedin-openid', 'instagram', 'threads'];

    public function __construct(
        private OAuthCredentialsSettings $oauthCredentials,
    ) {}

    /**
     * @param  mixed  $root
     * @param  array{provider: string, clientId: string, clientSecret: string}  $args
     */
    public function __invoke(mixed $root, array $args): bool
    {
        $provider = $args['provider'];
        if (! in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            return false;
        }
        $this->oauthCredentials->set(
            $provider,
            $args['clientId'],
            $args['clientSecret']
        );

        return true;
    }
}
