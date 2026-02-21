<?php

declare(strict_types=1);

namespace App\Foundation\Settings;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

final class OAuthCredentialsSettings
{
    private const KEY_PREFIX = 'oauth_';

    /**
     * Get OAuth client_id and client_secret for a provider (from DB, or null to use env).
     */
    public function get(string $provider): ?array
    {
        $clientId = $this->getValue(self::KEY_PREFIX . $provider . '_client_id');
        $clientSecret = $this->getEncrypted(self::KEY_PREFIX . $provider . '_client_secret');
        if ($clientId === null && $clientSecret === null) {
            return null;
        }

        return [
            'client_id' => $clientId ?? '',
            'client_secret' => $clientSecret ?? '',
        ];
    }

    /**
     * Set OAuth credentials for a provider (stored in DB; secret is encrypted).
     */
    public function set(string $provider, string $clientId, string $clientSecret): void
    {
        $this->setValue(self::KEY_PREFIX . $provider . '_client_id', $clientId);
        $this->setEncrypted(self::KEY_PREFIX . $provider . '_client_secret', $clientSecret);
    }

    /**
     * Return masked info for a provider (e.g. for settings UI: client_id last 4 chars, secret "set" or "not set").
     */
    public function getMasked(string $provider): array
    {
        $clientId = $this->getValue(self::KEY_PREFIX . $provider . '_client_id');
        $secret = $this->getEncrypted(self::KEY_PREFIX . $provider . '_client_secret');

        return [
            'provider' => $provider,
            'clientIdSet' => $clientId !== null && $clientId !== '',
            'clientIdMasked' => $clientId ? substr($clientId, 0, 4) . '…' : null,
            'clientSecretSet' => $secret !== null && $secret !== '',
        ];
    }

    private function getValue(string $key): ?string
    {
        $row = DB::table('settings')->where('key', $key)->first();

        return $row?->value;
    }

    private function setValue(string $key, string $value): void
    {
        DB::table('settings')->updateOrInsert(
            ['key' => $key],
            ['value' => $value, 'created_at' => now(), 'updated_at' => now()]
        );
    }

    private function getEncrypted(string $key): ?string
    {
        $raw = $this->getValue($key);
        if ($raw === null || $raw === '') {
            return null;
        }
        try {
            return Crypt::decryptString($raw);
        } catch (\Throwable) {
            return null;
        }
    }

    private function setEncrypted(string $key, string $value): void
    {
        $stored = $value === '' ? null : Crypt::encryptString($value);
        DB::table('settings')->updateOrInsert(
            ['key' => $key],
            ['value' => $stored, 'created_at' => now(), 'updated_at' => now()]
        );
    }
}
