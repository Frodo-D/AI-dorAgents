import type { CombinedRequirementsReview } from "../types.js";

// Doel: gecombineerde review omzetten naar leesbare markdown
export function renderCombinedRequirementsReviewMarkdown(
  review: CombinedRequirementsReview,
): string {
  return `# Combined Requirements Review

## Overall status
**${review.overallStatus}**

## Executive summary
${review.executiveSummary}

## Key risks
${renderList(review.keyRisks)}

## Recommendations
${renderList(review.recommendations)}

---

## 1. Requirements completeness
**Status:** ${review.completeness.overallStatus}

### Summary
${review.completeness.summary}

### Gaps
${renderList(review.completeness.gaps)}

### Missing states
${renderList(review.completeness.missingStates)}

### Missing validations
${renderList(review.completeness.missingValidations)}

### Missing permissions
${renderList(review.completeness.missingPermissions)}

---

## 2. Requirements alignment
**Status:** ${review.alignment.overallStatus}

### Summary
${review.alignment.summary}

### Gaps
${renderList(review.alignment.gaps)}

### Requirements not represented in design
${renderList(review.alignment.requirementsNotRepresentedInDesign)}

### Design elements without requirement basis
${renderList(review.alignment.designElementsWithoutRequirementBasis)}

### Contradictions
${renderList(review.alignment.contradictions)}

---

## 3. Missing states
**Status:** ${review.missingStates.overallStatus}

### Summary
${review.missingStates.summary}

### Missing states
${renderList(review.missingStates.missingStates)}

### Partially defined states
${renderList(review.missingStates.partiallyDefinedStates)}

### Inconsistent states
${renderList(review.missingStates.inconsistentStates)}

---

## 4. Missing validations
**Status:** ${review.missingValidations.overallStatus}

### Summary
${review.missingValidations.summary}

### Missing validations
${renderList(review.missingValidations.missingValidations)}

### Partially defined validations
${renderList(review.missingValidations.partiallyDefinedValidations)}

### Inconsistent validations
${renderList(review.missingValidations.inconsistentValidations)}

---

## 5. Missing permissions
**Status:** ${review.missingPermissions.overallStatus}

### Summary
${review.missingPermissions.summary}

### Missing permissions
${renderList(review.missingPermissions.missingPermissions)}

### Partially defined permissions
${renderList(review.missingPermissions.partiallyDefinedPermissions)}

### Inconsistent permissions
${renderList(review.missingPermissions.inconsistentPermissions)}
`;
}

function renderList(items: string[]): string {
  if (items.length === 0) {
    return "- None";
  }

  return items.map((item) => `- ${item}`).join("\n");
}
