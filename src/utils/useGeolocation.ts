import { useCallback, useEffect, useRef } from 'react';
import { GeoLocation } from '../types';
import { getDetailedAddress } from '../services/weatherService';
import { triggerHapticFeedback } from './helpers';

interface UseGeolocationProps {
    onSuccess: (location: GeoLocation) => void;
    onError: (errorMsg: string) => void;
    onStart?: () => void;
    hapticsEnabled?: boolean;
}

export const useGeolocation = ({ onSuccess, onError, onStart, hapticsEnabled = true }: UseGeolocationProps) => {
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    const onStartRef = useRef(onStart);

    useEffect(() => {
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
        onStartRef.current = onStart;
    }, [onSuccess, onError, onStart]);

    const haptic = useCallback((pattern?: number | number[]) => {
        if (hapticsEnabled) {
            triggerHapticFeedback(pattern);
        }
    }, [hapticsEnabled]);

    const getCurrentLocation = useCallback(() => {
        if (onStartRef.current) onStartRef.current();

        haptic(10);

        if (!navigator.geolocation) {
            onError('Cihazınız konum özelliğini desteklemiyor.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const details = await getDetailedAddress(latitude, longitude);

                    const loc: GeoLocation = {
                        id: Date.now(),
                        name: details.city,
                        latitude,
                        longitude,
                        country: details.country || 'Konum',
                        countryCode: details.countryCode,
                        subtext: details.address,
                        admin1: details.country
                    };

                    onSuccessRef.current(loc);
                    haptic(20);
                } catch (error) {
                    console.warn("Error processing location details:", error);
                    onErrorRef.current('Konum detayları alınamadı.');
                }
            },
            (err) => {
                console.warn("GPS Error:", err);
                onErrorRef.current('Konum alınamadı.');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, [haptic]);

    return { getCurrentLocation };
};
