// One operation with one root field, and no fragment spread or inline fragment around the root field
// (WIDGET-02 specification section 7.1.1). Only the fields the widget uses are selected: no institution,
// warning, coverage, `dataThrough`, `isPartial`, `asOf` or `rollupWatermark`.
export const METRIC_WIDGET_QUERY = `
  query MetricWidget($input: MetricWidgetInput!) {
    metricWidget(input: $input) {
      work { ...MetricWidgetSectionFields }
      chapters { ...MetricWidgetSectionFields }
      excludedChildCount
      platforms { platformId code displayName publicDescription }
      measures { measureId displayName definition }
      startDate
      endDate
    }
  }

  fragment MetricWidgetSectionFields on MetricWidgetSection {
    totals { platformId measureId value }
    timeline { platformId measureId startDate endDate value }
    countries { platformId measureId countryCode value }
  }
`;
