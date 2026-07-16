/**
 * Health Insurance Premium Calculation Engine - Optima Secure
 * Uses exact rates and discount logic from Excel data.
 */

export function calculatePremium(inputs, config, rates) {
    const { sumInsured, tenure, members, nri, deductible, newPolicy, firstTimeBuyer, claim, loyalty } = inputs;
    const rules = rates.discountRules;
    const breakdown = { adjustments: [], memberBreakdown: [] };
    
    // 1. Calculate Base Premium per member (including ABCD Loading)
    let membersWithPremium = members.map(member => {
        // Find base premium from rates JSON (keys are strings)
        const siKey = sumInsured.toString();
        // If exact age not found, cap at max age in rate chart (usually 100+)
        const ageKey = member.age.toString(); 
        
        let basePrem = 0;
        if (rates.baseRates[siKey] && rates.baseRates[siKey][ageKey]) {
            basePrem = rates.baseRates[siKey][ageKey];
        } else {
            // Fallback: try highest available age if not found (just in case)
            const availableAges = Object.keys(rates.baseRates[siKey]).map(Number).sort((a,b)=>a-b);
            const maxAge = availableAges[availableAges.length - 1];
            basePrem = rates.baseRates[siKey][maxAge.toString()];
        }

        // Apply ABCD Chronic loading
        let abcdLoading = 0;
        if (member.abcd) {
            abcdLoading = basePrem * rules.abcd_chronic_loading;
        }

        return {
            ...member,
            base: basePrem,
            abcdLoading: abcdLoading,
            totalBase: basePrem + abcdLoading
        };
    });

    // 2. Floater Discount Logic
    // Sort members by age descending. Oldest pays 100%, others get 55% discount.
    membersWithPremium.sort((a, b) => b.age - a.age);
    
    let annualFamilyBasePremium = 0;
    
    membersWithPremium.forEach((member, index) => {
        let isPrimary = index === 0;
        let floaterDiscount = isPrimary ? 0 : rules.floater_subsequent_member; // 55%
        
        let finalMemberPrem = Math.round(member.totalBase * (1 - floaterDiscount));
        annualFamilyBasePremium += finalMemberPrem;
        
        // Scale individual base premiums by the selected policy tenure
        let tenurePremium = finalMemberPrem * tenure;
        
        // Add to UI breakdown
        breakdown.memberBreakdown.push({
            name: member.name,
            age: member.age,
            relation: member.relation,
            premium: tenurePremium,
            note: isPrimary ? `(Primary × ${tenure} Yr${tenure > 1 ? 's' : ''})` : `(Floater -${Math.round(floaterDiscount*100)}% × ${tenure} Yr${tenure > 1 ? 's' : ''})`
        });
    });

    // Multi-year total base (before overall policy discounts)
    let totalPremium = annualFamilyBasePremium * tenure;
    breakdown.totalBasePremium = totalPremium;
    // 4. Tenure Discount
    if (tenure === 2) {
        let tenAmount = totalPremium * rules.long_term_2_yr;
        breakdown.adjustments.push({ name: 'Long Term Discount (2 Yrs)', amount: -tenAmount, type: 'discount_amount' });
        totalPremium -= tenAmount;
    } else if (tenure >= 3) {
        let tenAmount = totalPremium * rules.long_term_3_to_5_yr;
        breakdown.adjustments.push({ name: `Long Term Discount (${tenure} Yrs)`, amount: -tenAmount, type: 'discount_amount' });
        totalPremium -= tenAmount;
    }

    // --- OTHER DISCOUNTS TEMPORARILY EXCLUDED ---
    // 6. NRI Discount
    // 7. Lifetime Discount (New Policy + All < 35)
    // 8. Favorable Claims / First-Time Buyer Discount

    return {
        breakdown,
        finalPremium: Math.round(totalPremium)
    };
}
