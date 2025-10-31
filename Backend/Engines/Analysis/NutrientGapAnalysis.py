from dataclasses import dataclass
from typing import Dict, Any, List


@dataclass
class NutrientGapAnalysis:
    """Output structure for nutrient gap analysis"""
    nutrient_gaps: Dict[str, float]
    priority_nutrients: List[str]
    variability_flags: Dict[str, str]
    critical_warnings: List[str]
    summary_stats: Dict[str, Any]


class NutrientGapAnalyzer:
    """
    Analyzes nutritional intake vs targets to identify gaps and priorities.
    """
    #TODO:Fix Critical thresholds for warnings
    CRITICAL_NUTRIENTS = {
        'iron_mg': {'min': 8, 'max': 45, 'name': 'Iron'},
        'sodium': {'min': 500, 'max': 2300, 'name': 'Sodium'},
        'vitamin a': {'min': 0.3, 'max': 3.0, 'name': 'Vitamin A'},
        'calcium_mg': {'min': 800, 'max': 2500, 'name': 'Calcium'},
        'saturated fat': {'max': 20, 'name': 'Saturated Fat'}  # grams
    }

    def __init__(self, top_n_priorities: int = 5):
        self.top_n_priorities = top_n_priorities

    def analyze(self, data: Dict[str, Any]) -> NutrientGapAnalysis:
        # Step 1: Compute nutrient gaps
        nutrient_gaps = self._compute_gaps(
            data.get('macros_target', {}),
            data.get('micros_target', {}),
            data.get('weekly_actual', {}),
            data.get('TDEE', 0)
        )

        # Step 2: Rank priority nutrients
        priority_nutrients = self._rank_priorities(
            nutrient_gaps,
            data.get('goal', 'maintenance')
        )

        # Step 3: Extract variability flags
        variability_flags = self._extract_variability(
            data.get('patterns', {})
        )

        # Step 4: Generate critical warnings
        critical_warnings = self._check_critical_levels(
            data.get('weekly_actual', {}),
            nutrient_gaps
        )

        # Step 5: Compute summary statistics
        summary_stats = self._compute_summary(
            data,
            nutrient_gaps,
            priority_nutrients
        )

        return NutrientGapAnalysis(
            nutrient_gaps=nutrient_gaps,
            priority_nutrients=priority_nutrients,
            variability_flags=variability_flags,
            critical_warnings=critical_warnings,
            summary_stats=summary_stats
        )

    def _compute_gaps(
        self,
        macros_target: Dict[str, float],
        micros_target: Dict[str, float],
        weekly_actual: Dict[str, float],
        tdee: float
    ) -> Dict[str, float]:
        """
        Compute gaps between targets and actual intake.
        Positive = deficiency, Negative = excess
        """
        gaps = {}

        # Combine all targets
        all_targets = {**macros_target, **micros_target}

        # Add calorie target
        all_targets['calories'] = tdee

        # Compute gaps for all nutrients with targets
        for nutrient, target in all_targets.items():
            actual = weekly_actual.get(nutrient, 0)
            gap = target - actual
            gaps[nutrient] = round(gap, 2)

        return gaps

    def _rank_priorities(
        self,
        nutrient_gaps: Dict[str, float],
        goal: str
    ) -> List[str]:
        """
        Rank nutrients by priority based on gap magnitude and user goal.
        """
        # Create priority scores
        priority_scores = []

        for nutrient, gap in nutrient_gaps.items():
            # Base score is absolute gap magnitude
            score = abs(gap)

            # Apply goal-specific weighting
            if goal == 'weight_loss':
                # Prioritize protein (preserves muscle), fiber (satiety)
                if 'protein' in nutrient.lower():
                    score *= 1.5
                elif 'fiber' in nutrient.lower():
                    score *= 1.3
            elif goal == 'muscle_gain':
                # Prioritize protein and calories
                if 'protein' in nutrient.lower():
                    score *= 1.8
                elif 'calories' in nutrient.lower():
                    score *= 1.2
            elif goal == 'maintenance':
                # Balanced approach, slight emphasis on micronutrients
                if nutrient in ['calcium_mg', 'iron_mg', 'vitaminC_mg']:
                    score *= 1.2

            # Only prioritize deficiencies (positive gaps), not excesses
            if gap > 0:
                priority_scores.append((nutrient, score))

        # Sort by score (highest first) and take top N
        priority_scores.sort(key=lambda x: x[1], reverse=True)
        priority_nutrients = [nutrient for nutrient, _ in priority_scores[:self.top_n_priorities]]

        return priority_nutrients

    def _extract_variability(self, patterns: Dict[str, str]) -> Dict[str, str]:
        """
        Extract variability flags from patterns dictionary.
        """
        variability = {}

        for key, value in patterns.items():
            if '_variability' in key:
                # Remove '_variability' suffix to get nutrient name
                nutrient = key.replace('_variability', '')
                variability[nutrient] = value

        return variability

    def _check_critical_levels(
        self,
        weekly_actual: Dict[str, float],
        nutrient_gaps: Dict[str, float]
    ) -> List[str]:
        """
        Check for critically low or high nutrient levels.
        """
        warnings = []

        for nutrient, thresholds in self.CRITICAL_NUTRIENTS.items():
            actual = weekly_actual.get(nutrient, 0)
            name = thresholds['name']

            # Check minimum threshold
            if 'min' in thresholds and actual < thresholds['min']:
                warnings.append(
                    f"⚠️ {name} critically low: {actual:.1f} (minimum: {thresholds['min']})"
                )

            # Check maximum threshold
            if 'max' in thresholds and actual > thresholds['max']:
                warnings.append(
                    f"⚠️ {name} critically high: {actual:.1f} (maximum: {thresholds['max']})"
                )

        return warnings

    def _compute_summary(
        self,
        data: Dict[str, Any],
        nutrient_gaps: Dict[str, float],
        priority_nutrients: List[str]
    ) -> Dict[str, Any]:
        """
        Compute summary statistics for the analysis.
        """
        weekly_actual = data.get('weekly_actual', {})
        tdee = data.get('TDEE', 0)

        # Calculate adherence percentages
        calories_actual = weekly_actual.get('calories', 0)
        calorie_adherence = (calories_actual / tdee * 100) if tdee > 0 else 0

        # Count deficiencies and excesses
        deficiencies = sum(1 for gap in nutrient_gaps.values() if gap > 0)
        excesses = sum(1 for gap in nutrient_gaps.values() if gap < 0)

        # High variability count
        patterns = data.get('patterns', {})
        high_variability_count = sum(
            1 for v in patterns.values() if v == 'high'
        )

        return {
            'calorie_adherence_pct': round(calorie_adherence, 1),
            'total_nutrients_tracked': len(nutrient_gaps),
            'nutrients_deficient': deficiencies,
            'nutrients_excessive': excesses,
            'high_variability_nutrients': high_variability_count,
            'top_priority_count': len(priority_nutrients),
            'goal': data.get('goal', 'maintenance')
        }

    def format_report(self, analysis: NutrientGapAnalysis) -> str:
        """
        Format analysis results into a human-readable report.
        """
        report = []
        report.append("=" * 60)
        report.append("NUTRIENT GAP ANALYSIS REPORT")
        report.append("=" * 60)

        # Summary
        report.append("\n📊 SUMMARY")
        report.append("-" * 60)
        stats = analysis.summary_stats
        report.append(f"Goal: {stats['goal'].replace('_', ' ').title()}")
        report.append(f"Calorie Adherence: {stats['calorie_adherence_pct']}%")
        report.append(f"Nutrients Deficient: {stats['nutrients_deficient']}")
        report.append(f"Nutrients Excessive: {stats['nutrients_excessive']}")
        report.append(f"High Variability Count: {stats['high_variability_nutrients']}")

        # Critical Warnings
        if analysis.critical_warnings:
            report.append("\n🚨 CRITICAL WARNINGS")
            report.append("-" * 60)
            for warning in analysis.critical_warnings:
                report.append(warning)

        # Priority Nutrients
        report.append("\n🎯 TOP PRIORITY NUTRIENTS (Most Deficient)")
        report.append("-" * 60)
        for i, nutrient in enumerate(analysis.priority_nutrients, 1):
            gap = analysis.nutrient_gaps[nutrient]
            variability = analysis.variability_flags.get(nutrient, 'unknown')
            report.append(
                f"{i}. {nutrient}: {gap:+.1f} deficit | Variability: {variability}"
            )

        # All Nutrient Gaps (sorted by magnitude)
        report.append("\n📋 ALL NUTRIENT GAPS")
        report.append("-" * 60)
        sorted_gaps = sorted(
            analysis.nutrient_gaps.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )
        for nutrient, gap in sorted_gaps:
            status = "deficit" if gap > 0 else "excess"
            variability = analysis.variability_flags.get(nutrient, '-')
            report.append(
                f"{nutrient:30s}: {gap:+8.1f} ({status}) | Var: {variability}"
            )

        report.append("\n" + "=" * 60)

        return "\n".join(report)
