export const CHART_TOOLTIP_STYLE = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 6,
    fontSize: 12,
};

export const CHART_GRID_STROKE = 'var(--border-color)';
export const CHART_TICK_STYLE = { fontSize: 11, fill: 'var(--text-muted)' };
export const CHART_CATEGORY_TICK_STYLE = { fontSize: 11, fill: 'var(--text-secondary)' };
export const CHART_CURSOR_FILL = { fill: 'var(--bg-surface-secondary)' };

// Categorical series colors, drawn from the same semantic palette as badges/status dots
// so charts read as part of the same system rather than a different template.
export const CHART_PALETTE = [
    'var(--blue)',
    'var(--green)',
    'var(--pink)',
    'var(--orange)',
    'var(--cyan)',
    'var(--indigo)',
    'var(--purple)',
    'var(--red)',
];
