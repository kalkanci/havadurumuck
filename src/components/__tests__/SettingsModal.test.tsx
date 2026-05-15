// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import SettingsModal from '../SettingsModal';
import { AppSettings } from '../../types';

describe('SettingsModal', () => {
    const mockSettings: AppSettings = {
        hapticsEnabled: true,
        temperatureUnit: 'celsius',
        windSpeedUnit: 'kmh'
    };

    afterEach(() => {
        cleanup();
    });

    it('renders the PWA install button when onInstall is provided', () => {
        const handleInstall = vi.fn();
        render(
            <SettingsModal
                isOpen={true}
                onClose={vi.fn()}
                settings={mockSettings}
                onUpdate={vi.fn()}
                onInstall={handleInstall}
            />
        );

        const installButton = screen.getByText('Uygulamayı Yükle');
        expect(installButton).toBeInTheDocument();

        fireEvent.click(installButton);
        expect(handleInstall).toHaveBeenCalledTimes(1);
    });

    it('does not render the PWA install button when onInstall is undefined', () => {
        render(
            <SettingsModal
                isOpen={true}
                onClose={vi.fn()}
                settings={mockSettings}
                onUpdate={vi.fn()}
            />
        );

        const installButton = screen.queryByText('Uygulamayı Yükle');
        expect(installButton).not.toBeInTheDocument();
    });
});
