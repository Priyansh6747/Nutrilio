from dataclasses import dataclass
from datetime import timedelta
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





@dataclass
class MealRecommendation:
    """Output structure for meal recommendations"""
    recommended_meals: List[Dict[str, Any]]
    nutrient_coverage_summary: Dict[str, float]
    recommendation_metadata: Dict[str, Any]


class MealRecommender:
    """
    Recommends meals from user's historical data based on nutrient gaps.
    """

    # Nutrient importance weights by goal
    GOAL_WEIGHTS = {
        'weight_loss': {
            'protein_g': 1.5,
            'fiber_g': 1.3,
            'calories': 0.7,
            'saturated_fat_g': 0.5,
            'default': 1.0
        },
        'muscle_gain': {
            'protein_g': 1.8,
            'calories': 1.2,
            'carbs_g': 1.1,
            'default': 1.0
        },
        'maintenance': {
            'calcium_mg': 1.2,
            'iron_mg': 1.2,
            'vitaminC_mg': 1.2,
            'fiber_g': 1.1,
            'default': 1.0
        }
    }

    # Daily recommended intakes (approximate averages)
    DAILY_RECOMMENDATIONS = {
        'protein_g': 50,
        'carbs_g': 275,
        'fat_g': 78,
        'fiber_g': 28,
        'calcium_mg': 1000,
        'iron_mg': 18,
        'vitaminC_mg': 90,
        'sodium_mg': 2300,
        'saturated_fat_g': 20,
        'calories': 2000  # Default, should use TDEE
    }

    def __init__(self, top_n_recommendations: int = 5):
        self.top_n_recommendations = top_n_recommendations

    def recommend(
            self,
            historical_meals: List[Dict[str, Any]],
            nutrient_gaps: Dict[str, float],
            priority_nutrients: List[str],
            goal: str,
            tdee: float,
            exclude_recent_days: int = 3
    ) -> MealRecommendation:
        """
        Main recommendation function.

        Args:
            historical_meals: List of user's past meals from get_all_meals()
            nutrient_gaps: From NutrientGapAnalysis (positive = deficiency)
            priority_nutrients: From NutrientGapAnalysis
            goal: User's goal (weight_loss, muscle_gain, maintenance)
            tdee: Total Daily Energy Expenditure
            exclude_recent_days: Don't recommend meals eaten in last N days
        """
        # Step 1: Filter eligible meals
        eligible_meals = self._filter_eligible_meals(
            historical_meals,
            exclude_recent_days
        )

        if not eligible_meals:
            return self._empty_recommendation()

        # Step 2: Normalize and score meals
        scored_meals = []
        for meal in eligible_meals:
            normalized = self._normalize_meal_nutrients(meal, tdee)
            score = self._compute_match_score(
                normalized,
                nutrient_gaps,
                priority_nutrients,
                goal,
                tdee
            )

            if score > 0:  # Only include meals with positive scores
                scored_meals.append({
                    'meal': meal,
                    'normalized': normalized,
                    'score': score
                })

        # Step 3: Rank and select top N
        scored_meals.sort(key=lambda x: x['score'], reverse=True)
        top_meals = scored_meals[:self.top_n_recommendations]

        # Step 4: Build recommendation output
        recommendations = self._build_recommendations(
            top_meals,
            nutrient_gaps,
            priority_nutrients,
            goal
        )

        # Step 5: Calculate nutrient coverage
        coverage = self._calculate_coverage(
            top_meals,
            nutrient_gaps,
            priority_nutrients
        )

        # Step 6: Metadata
        metadata = {
            'total_meals_analyzed': len(eligible_meals),
            'meals_with_positive_score': len(scored_meals),
            'recommendations_returned': len(recommendations),
            'goal': goal,
            'tdee': tdee
        }

        return MealRecommendation(
            recommended_meals=recommendations,
            nutrient_coverage_summary=coverage,
            recommendation_metadata=metadata
        )

    def _filter_eligible_meals(
            self,
            meals: List[Dict[str, Any]],
            exclude_recent_days: int
    ) -> List[Dict[str, Any]]:
        """Filter out recent meals and incomplete data"""
        from datetime import datetime, timezone

        cutoff_date = datetime.now(timezone.utc) - timedelta(days=exclude_recent_days)
        eligible = []

        for meal in meals:
            # Check if meal has timestamp
            if 'timestamp' not in meal:
                continue

            # Parse timestamp
            meal_date = meal['timestamp']
            if isinstance(meal_date, str):
                try:
                    meal_date = datetime.fromisoformat(meal_date.replace('Z', '+00:00'))
                except:
                    continue

            # Skip recent meals
            if meal_date > cutoff_date:
                continue

            # Must have nutrients and name
            if 'nutrients' not in meal or not meal.get('name'):
                continue

            # Must have at least some nutrient data
            if len(meal['nutrients']) < 3:
                continue

            eligible.append(meal)

        return eligible

    def _normalize_meal_nutrients(
            self,
            meal: Dict[str, Any],
            tdee: float
    ) -> Dict[str, float]:
        """
        Convert meal nutrients to % of daily recommended intake.
        Returns dict of {nutrient_name: percentage_of_daily}
        """
        normalized = {}
        recommendations = self.DAILY_RECOMMENDATIONS.copy()
        recommendations['calories'] = tdee  # Use actual TDEE

        # Extract nutrients from meal
        meal_nutrients = {}
        for nutrient in meal.get('nutrients', []):
            name = nutrient.get('name', '').lower()
            amt = nutrient.get('amt', 0)

            # Standardize nutrient names
            name = self._standardize_nutrient_name(name)
            meal_nutrients[name] = amt

        # Normalize against recommendations
        for nutrient, amount in meal_nutrients.items():
            if nutrient in recommendations:
                daily_rec = recommendations[nutrient]
                if daily_rec > 0:
                    normalized[nutrient] = (amount / daily_rec) * 100

        return normalized

    def _standardize_nutrient_name(self, name: str) -> str:
        """Standardize nutrient names for matching"""
        name = name.lower().strip()

        # Common mappings
        mappings = {
            'protein': 'protein_g',
            'carbohydrate': 'carbs_g',
            'carbs': 'carbs_g',
            'fat': 'fat_g',
            'fiber': 'fiber_g',
            'calcium': 'calcium_mg',
            'iron': 'iron_mg',
            'vitamin c': 'vitaminC_mg',
            'sodium': 'sodium_mg',
            'saturated fat': 'saturated_fat_g',
            'energy': 'calories',
            'kcal': 'calories'
        }

        return mappings.get(name, name)

    def _compute_match_score(
            self,
            normalized_meal: Dict[str, float],
            nutrient_gaps: Dict[str, float],
            priority_nutrients: List[str],
            goal: str,
            tdee: float
    ) -> float:
        """
        Compute how well a meal addresses nutrient gaps.
        Higher score = better match.
        """
        score = 0.0
        goal_weights = self.GOAL_WEIGHTS.get(goal, self.GOAL_WEIGHTS['maintenance'])

        # Get raw nutrient values from normalized percentages
        meal_nutrients = self._denormalize_nutrients(normalized_meal, tdee)

        # Score based on gap filling
        for nutrient, gap in nutrient_gaps.items():
            if gap <= 0:  # Skip excesses or met targets
                continue

            if nutrient not in meal_nutrients:
                continue

            meal_amount = meal_nutrients[nutrient]

            # Calculate contribution (capped at 1.0 to avoid overshooting bonus)
            contribution = min(meal_amount / gap, 1.0)

            # Apply priority weight
            weight = goal_weights.get(nutrient, goal_weights['default'])
            if nutrient in priority_nutrients:
                weight *= 1.5  # Boost priority nutrients

            score += contribution * weight

        # Apply goal-specific adjustments
        score = self._apply_goal_bias(score, meal_nutrients, goal, tdee)

        return round(score, 3)

    def _denormalize_nutrients(
            self,
            normalized: Dict[str, float],
            tdee: float
    ) -> Dict[str, float]:
        """Convert normalized percentages back to actual amounts"""
        recommendations = self.DAILY_RECOMMENDATIONS.copy()
        recommendations['calories'] = tdee

        denormalized = {}
        for nutrient, percentage in normalized.items():
            if nutrient in recommendations:
                denormalized[nutrient] = (percentage / 100) * recommendations[nutrient]

        return denormalized

    def _apply_goal_bias(
            self,
            base_score: float,
            meal_nutrients: Dict[str, float],
            goal: str,
            tdee: float
    ) -> float:
        """Adjust score based on goal-specific preferences"""
        score = base_score

        calories = meal_nutrients.get('calories', 0)
        protein = meal_nutrients.get('protein_g', 0)
        sat_fat = meal_nutrients.get('saturated_fat_g', 0)

        if goal == 'weight_loss':
            # Penalize high-calorie meals
            if calories > tdee / 3:  # More than 1/3 daily calories
                score *= 0.8

            # Penalize high saturated fat
            if sat_fat > 7:  # >7g saturated fat
                score *= 0.85

            # Reward high protein, moderate calories
            if protein > 20 and calories < tdee / 3:
                score *= 1.15

        elif goal == 'muscle_gain':
            # Reward high protein + high calories
            if protein > 25 and calories > 400:
                score *= 1.2
            elif protein > 20:
                score *= 1.1

        elif goal == 'maintenance':
            # Reward balanced macros
            carbs = meal_nutrients.get('carbs_g', 0)
            fat = meal_nutrients.get('fat_g', 0)

            # Check macro balance (rough 40/30/30 or similar)
            if all([protein > 15, carbs > 30, fat > 10]):
                score *= 1.1

        return score

    def _build_recommendations(
            self,
            top_meals: List[Dict[str, Any]],
            nutrient_gaps: Dict[str, float],
            priority_nutrients: List[str],
            goal: str
    ) -> List[Dict[str, Any]]:
        """Build formatted recommendation list"""
        recommendations = []

        for ranked_meal in top_meals:
            meal = ranked_meal['meal']
            score = ranked_meal['score']
            meal_nutrients = ranked_meal.get('normalized', {})

            # Extract key nutrients that address gaps
            key_nutrients = self._extract_key_nutrients(
                meal,
                nutrient_gaps,
                priority_nutrients
            )

            # Generate reason
            reason = self._generate_reason(
                meal,
                key_nutrients,
                nutrient_gaps,
                goal
            )

            # Goal alignment
            alignment = self._assess_goal_alignment(meal, goal)

            recommendations.append({
                'name': meal.get('name', 'Unknown Meal'),
                'score': score,
                'key_nutrients': key_nutrients,
                'goal_alignment': alignment,
                'reason': reason,
                'meal_id': meal.get('id', ''),
                'timestamp': str(meal.get('timestamp', ''))
            })

        return recommendations

    def _extract_key_nutrients(
            self,
            meal: Dict[str, Any],
            nutrient_gaps: Dict[str, float],
            priority_nutrients: List[str]
    ) -> Dict[str, float]:
        """Extract top nutrients that address gaps"""
        key_nutrients = {}

        meal_nutrients = {}
        for nutrient in meal.get('nutrients', []):
            name = self._standardize_nutrient_name(nutrient.get('name', ''))
            amt = nutrient.get('amt', 0)
            meal_nutrients[name] = amt

        # Find nutrients that address priority gaps
        for nutrient in priority_nutrients[:5]:  # Top 5 priorities
            if nutrient in meal_nutrients and nutrient in nutrient_gaps:
                if nutrient_gaps[nutrient] > 0:  # Has a gap
                    key_nutrients[nutrient] = round(meal_nutrients[nutrient], 2)

        # Add other significant nutrients
        for nutrient, amount in meal_nutrients.items():
            if len(key_nutrients) >= 5:
                break
            if nutrient not in key_nutrients and amount > 0:
                key_nutrients[nutrient] = round(amount, 2)

        return key_nutrients

    def _generate_reason(
            self,
            meal: Dict[str, Any],
            key_nutrients: Dict[str, float],
            nutrient_gaps: Dict[str, float],
            goal: str
    ) -> str:
        """Generate human-readable reason for recommendation"""
        reasons = []

        # Identify top contributing nutrients
        top_contributors = []
        for nutrient, amount in key_nutrients.items():
            if nutrient in nutrient_gaps and nutrient_gaps[nutrient] > 0:
                contribution_pct = (amount / nutrient_gaps[nutrient]) * 100
                if contribution_pct > 20:
                    nutrient_display = nutrient.replace('_', ' ').title()
                    top_contributors.append(f"{nutrient_display}")

        if top_contributors:
            reasons.append(f"Rich in {', '.join(top_contributors[:3])}")

        # Check calorie appropriateness
        calories = key_nutrients.get('calories', 0)
        if goal == 'weight_loss' and calories < 400:
            reasons.append("moderate calories")
        elif goal == 'muscle_gain' and calories > 400:
            reasons.append("energy-dense")

        # Protein check
        protein = key_nutrients.get('protein_g', 0)
        if protein > 20:
            reasons.append("high protein")

        if not reasons:
            reasons.append("balanced nutrition")

        return "; ".join(reasons[:3])

    def _assess_goal_alignment(self, meal: Dict[str, Any], goal: str) -> str:
        """Assess how well meal aligns with goal"""
        meal_nutrients = {}
        for nutrient in meal.get('nutrients', []):
            name = self._standardize_nutrient_name(nutrient.get('name', ''))
            amt = nutrient.get('amt', 0)
            meal_nutrients[name] = amt

        calories = meal_nutrients.get('calories', 0)
        protein = meal_nutrients.get('protein_g', 0)

        if goal == 'weight_loss':
            if calories < 350 and protein > 15:
                return "excellent for weight loss"
            elif calories < 500:
                return "good for weight loss"
            else:
                return "moderate for weight loss"

        elif goal == 'muscle_gain':
            if protein > 25 and calories > 400:
                return "excellent for muscle gain"
            elif protein > 20:
                return "good for muscle gain"
            else:
                return "moderate for muscle gain"

        else:  # maintenance
            if protein > 15 and calories < 600:
                return "well-balanced for maintenance"
            else:
                return "suitable for maintenance"

    def _calculate_coverage(
            self,
            top_meals: List[Dict[str, Any]],
            nutrient_gaps: Dict[str, float],
            priority_nutrients: List[str]
    ) -> Dict[str, float]:
        """Calculate how much of each gap is filled by recommendations"""
        coverage = {}

        # Aggregate nutrients from all recommended meals
        total_nutrients = {}
        for ranked_meal in top_meals:
            meal = ranked_meal['meal']
            for nutrient in meal.get('nutrients', []):
                name = self._standardize_nutrient_name(nutrient.get('name', ''))
                amt = nutrient.get('amt', 0)
                total_nutrients[name] = total_nutrients.get(name, 0) + amt

        # Calculate coverage for each priority nutrient
        for nutrient in priority_nutrients:
            if nutrient in nutrient_gaps and nutrient_gaps[nutrient] > 0:
                filled = total_nutrients.get(nutrient, 0)
                gap = nutrient_gaps[nutrient]
                coverage_pct = (filled / gap) * 100
                coverage[f"{nutrient}_gap_filled_pct"] = round(
                    min(coverage_pct, 100), 1
                )

        # Overall coverage
        if coverage:
            avg_coverage = sum(coverage.values()) / len(coverage)
            coverage['total_gap_filled_pct'] = round(avg_coverage, 1)
        else:
            coverage['total_gap_filled_pct'] = 0.0

        return coverage

    def _empty_recommendation(self) -> MealRecommendation:
        """Return empty recommendation when no meals available"""
        return MealRecommendation(
            recommended_meals=[],
            nutrient_coverage_summary={'total_gap_filled_pct': 0.0},
            recommendation_metadata={
                'total_meals_analyzed': 0,
                'meals_with_positive_score': 0,
                'recommendations_returned': 0,
                'error': 'No eligible meals found'
            }
        )

    def format_recommendations(self, recommendation: MealRecommendation) -> str:
        """Format recommendations into human-readable report"""
        report = []
        report.append("=" * 60)
        report.append("PERSONALIZED MEAL RECOMMENDATIONS")
        report.append("=" * 60)

        # Metadata
        meta = recommendation.recommendation_metadata
        report.append(f"\nGoal: {meta.get('goal', 'Unknown').replace('_', ' ').title()}")
        report.append(f"Meals Analyzed: {meta.get('total_meals_analyzed', 0)}")
        report.append(f"Recommendations: {meta.get('recommendations_returned', 0)}")

        # Recommendations
        report.append("\n🍽️  RECOMMENDED MEALS")
        report.append("-" * 60)

        for i, meal in enumerate(recommendation.recommended_meals, 1):
            report.append(f"\n{i}. {meal['name']}")
            report.append(f"   Match Score: {meal['score']:.2f}")
            report.append(f"   Goal Alignment: {meal['goal_alignment']}")
            report.append(f"   Reason: {meal['reason']}")
            report.append(f"   Key Nutrients:")
            for nutrient, amount in list(meal['key_nutrients'].items())[:5]:
                nutrient_display = nutrient.replace('_', ' ').title()
                report.append(f"      • {nutrient_display}: {amount:.1f}")

        # Coverage Summary
        report.append("\n📊 NUTRIENT GAP COVERAGE")
        report.append("-" * 60)
        coverage = recommendation.nutrient_coverage_summary

        for key, value in sorted(coverage.items()):
            if key != 'total_gap_filled_pct':
                nutrient = key.replace('_gap_filled_pct', '').replace('_', ' ').title()
                report.append(f"{nutrient}: {value:.1f}% of gap filled")

        report.append(f"\nOverall Coverage: {coverage.get('total_gap_filled_pct', 0):.1f}%")
        report.append("\n" + "=" * 60)

        return "\n".join(report)