// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import SettingsModal from '../SettingsModal';
import { AppSettings } from '../../types';

describe('SettingsModal Component', () => {
    const defaultSettings: AppSettings = {
        hapticsEnabled: true,
        temperatureUnit: 'celsius'
    };

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders without crashing when isOpen is true', () => {
        render(
            <SettingsModal
                isOpen={true}
                onClose={() => {}}
                settings={defaultSettings}
                onUpdate={() => {}}
            />
        );
        expect(screen.getByText('Ayarlar')).toBeInTheDocument();
        expect(screen.queryByText('Uygulamayı Yükle')).not.toBeInTheDocument();
    });

    it('renders the install button when onInstall is provided', () => {
        const onInstallMock = vi.fn();
        render(
            <SettingsModal
                isOpen={true}
                onClose={() => {}}
                settings={defaultSettings}
                onUpdate={() => {}}
                onInstall={onInstallMock}
            />
        );
        const installButtonText = screen.getByText('Uygulamayı Yükle');
        expect(installButtonText).toBeInTheDocument();

        // Find the button (closest ancestor button to the text)
        const installButton = installButtonText.closest('button');
        expect(installButton).not.toBeNull();
        if (installButton) {
            fireEvent.click(installButton);
            expect(onInstallMock).toHaveBeenCalledTimes(1);
        }
    });

    it('does not render the install button when onInstall is not provided', () => {
        render(
            <SettingsModal
                isOpen={true}
                onClose={() => {}}
                settings={defaultSettings}
                onUpdate={() => {}}
            />
        );
        expect(screen.queryByText('Uygulamayı Yükle')).not.toBeInTheDocument();
    });
});
