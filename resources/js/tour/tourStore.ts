export interface TourState {
    active: boolean;
    segmentIndex: number;
    stepIndex: number;
}

const STORAGE_KEY = 'revisiondesk_tour_state';
const IDLE_STATE: TourState = { active: false, segmentIndex: 0, stepIndex: 0 };

function readInitialState(): TourState {
    if (typeof window === 'undefined') return IDLE_STATE;
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as TourState) : IDLE_STATE;
    } catch {
        return IDLE_STATE;
    }
}

let state: TourState = readInitialState();
const listeners = new Set<() => void>();

export function getTourState(): TourState {
    return state;
}

export function setTourState(next: TourState): void {
    state = next;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    listeners.forEach((listener) => listener());
}

export function subscribeTour(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

// Guards the Dashboard's auto-start check so it only ever evaluates once per browser
// tab session, even if the Dashboard component happens to mount more than once (e.g. as
// the tour returns there for its closing step) — prevents a stray remount from resetting
// an in-progress tour back to its first step.
let autoStartChecked = false;

export function consumeAutoStart(hasCompletedTour: boolean): boolean {
    if (autoStartChecked) return false;
    autoStartChecked = true;
    return !hasCompletedTour;
}
