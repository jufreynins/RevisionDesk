import { router } from '@inertiajs/react';
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { getTourState, setTourState, subscribeTour, TourState } from './tourStore';
import { TOUR_SEGMENTS, TourSegment } from './steps';

const IDLE_STATE: TourState = { active: false, segmentIndex: 0, stepIndex: 0 };

export type TourApi = ReturnType<typeof useTour>;

export function useTour(ctx: { isAdmin: boolean; canManage: boolean }) {
    const state = useSyncExternalStore(subscribeTour, getTourState);

    const segments = useMemo(
        () => TOUR_SEGMENTS.filter((segment) => !segment.visible || segment.visible(ctx)),
        [ctx.isAdmin, ctx.canManage],
    );

    const navigateToSegment = useCallback((segment: TourSegment) => {
        if (route().current(segment.routeName)) return;
        const base = route(segment.routeName);
        router.visit(segment.query ? `${base}?${segment.query}` : base, { preserveScroll: true });
    }, []);

    const finish = useCallback(() => {
        setTourState(IDLE_STATE);
        router.patch(route('tour.complete'), {}, { preserveScroll: true, preserveState: true });
    }, []);

    const start = useCallback(() => {
        if (segments.length === 0) return;
        setTourState({ active: true, segmentIndex: 0, stepIndex: 0 });
        navigateToSegment(segments[0]);
    }, [navigateToSegment, segments]);

    // next/back always re-read the store instead of closing over `state`, so a click can
    // never act on a value from a render that's already been superseded.
    const next = useCallback(() => {
        const current = getTourState();
        const segment = segments[current.segmentIndex];
        if (!segment) {
            finish();
            return;
        }

        if (current.stepIndex + 1 < segment.steps.length) {
            setTourState({ ...current, stepIndex: current.stepIndex + 1 });
            return;
        }

        const nextSegmentIndex = current.segmentIndex + 1;
        if (nextSegmentIndex >= segments.length) {
            finish();
            return;
        }

        setTourState({ active: true, segmentIndex: nextSegmentIndex, stepIndex: 0 });
        navigateToSegment(segments[nextSegmentIndex]);
    }, [segments, navigateToSegment, finish]);

    const back = useCallback(() => {
        const current = getTourState();

        if (current.stepIndex > 0) {
            setTourState({ ...current, stepIndex: current.stepIndex - 1 });
            return;
        }
        if (current.segmentIndex === 0) return;

        const prevSegmentIndex = current.segmentIndex - 1;
        const prevSegment = segments[prevSegmentIndex];
        setTourState({ active: true, segmentIndex: prevSegmentIndex, stepIndex: prevSegment.steps.length - 1 });
        navigateToSegment(prevSegment);
    }, [segments, navigateToSegment]);

    const segment = segments[state.segmentIndex];
    const step = segment?.steps[state.stepIndex];
    const onCorrectPage = segment ? route().current(segment.routeName) : false;

    // Safety net: if a router.visit() call is ever dropped (e.g. superseded by another
    // in-flight navigation), the store's segment and the actual URL can disagree. Re-issuing
    // the visit for the current segment brings the page back in sync.
    const resync = useCallback(() => {
        const current = getTourState();
        const currentSegment = segments[current.segmentIndex];
        if (current.active && currentSegment) {
            navigateToSegment(currentSegment);
        }
    }, [segments, navigateToSegment]);

    const stepNumber =
        segments.slice(0, state.segmentIndex).reduce((sum, s) => sum + s.steps.length, 0) + state.stepIndex + 1;
    const totalSteps = segments.reduce((sum, s) => sum + s.steps.length, 0);
    const isLastStep = stepNumber >= totalSteps;

    return {
        active: state.active,
        step,
        onCorrectPage,
        stepNumber,
        totalSteps,
        isFirstStep: state.segmentIndex === 0 && state.stepIndex === 0,
        isLastStep,
        start,
        next,
        back,
        skip: finish,
        resync,
    };
}
