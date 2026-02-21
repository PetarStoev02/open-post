<?php

declare(strict_types=1);

namespace App\SocialAccounts\IO\Http\Controllers;

use App\SocialAccounts\Entities\Models\Workspace;
use App\SocialAccounts\UseCases\ConnectOrUpdateSocialAccountInteractor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Contracts\User as SocialiteUser;

final class OAuthController
{
    private const ALLOWED_PROVIDERS = ['x', 'linkedin-openid'];

    private const PLATFORM_MAP = [
        'x' => 'twitter',
        'linkedin-openid' => 'linkedin',
    ];

    public function __construct(
        private ConnectOrUpdateSocialAccountInteractor $connectInteractor,
    ) {}

    /**
     * Redirect to the OAuth provider.
     */
    public function redirect(Request $request, string $provider): RedirectResponse
    {
        if (! in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            abort(404, 'Unknown OAuth provider.');
        }

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Handle the OAuth callback and store the social account.
     */
    public function callback(Request $request, string $provider): RedirectResponse
    {
        if (! in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            abort(404, 'Unknown OAuth provider.');
        }

        $socialiteUser = Socialite::driver($provider)->user();
        $workspace = Workspace::query()->where('slug', 'default')->firstOrFail();
        $platform = self::PLATFORM_MAP[$provider];

        $tokenExpiresAt = null;
        if (method_exists($socialiteUser, 'getExpiresIn') && $socialiteUser->getExpiresIn() !== null) {
            $tokenExpiresAt = Carbon::now()->addSeconds($socialiteUser->getExpiresIn());
        }

        $this->connectInteractor->execute(
            workspaceId: $workspace->id,
            platform: $platform,
            platformUserId: (string) $socialiteUser->getId(),
            accessToken: $socialiteUser->getToken(),
            refreshToken: $socialiteUser->getRefreshToken(),
            tokenExpiresAt: $tokenExpiresAt,
            metadata: $this->buildMetadata($socialiteUser)
        );

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

        return redirect($frontendUrl . '/accounts?connected=1');
    }

    private function buildMetadata(SocialiteUser $user): array
    {
        $metadata = [];
        if (method_exists($user, 'getName') && $user->getName() !== null) {
            $metadata['name'] = $user->getName();
        }
        if (method_exists($user, 'getEmail') && $user->getEmail() !== null) {
            $metadata['email'] = $user->getEmail();
        }
        if (method_exists($user, 'getAvatar') && $user->getAvatar() !== null) {
            $metadata['avatar'] = $user->getAvatar();
        }
        if (method_exists($user, 'getNickname') && $user->getNickname() !== null) {
            $metadata['username'] = $user->getNickname();
        }

        return $metadata;
    }
}
