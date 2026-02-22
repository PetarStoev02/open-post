<?php

declare(strict_types=1);

namespace App\SocialAccounts\Entities;

final class SupportedOAuthProvider
{
    /** All OAuth provider keys supported by Socialite. */
    public const ALL = ['x', 'linkedin-openid', 'threads'];

    /** Maps OAuth provider key to internal platform name. */
    public const PLATFORM_MAP = [
        'x' => 'twitter',
        'linkedin-openid' => 'linkedin',
        'threads' => 'threads',
    ];

    public static function isValid(string $provider): bool
    {
        return in_array($provider, self::ALL, true);
    }
}
