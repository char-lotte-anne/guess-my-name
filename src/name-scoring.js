/**
 * Scoring a candidate name against a set of quiz answers.
 *
 * Pure functions, extracted from the quiz class so they can be tested without
 * a DOM: each takes the answers it needs rather than reading `this.answers`.
 * This is the part of the app that decides what you actually see, and it is
 * where a scoring change is most likely to go unnoticed.
 *
 * `nameInfo` is a record from nameDatabase.js. `answers` is keyed by the
 * question `key` values in quiz-data.js.
 */

/**
 * Multi-select answers are arrays, single-select answers are bare values, and
 * both reach these functions. Normalise before comparing.
 */
function toArray(value) {
    if (value === undefined || value === null || value === '') return [];
    return Array.isArray(value) ? value : [value];
}

function getDecadePopularity(nameInfo, decade) {
    const decadeRanges = {
        1900: [1900, 1909],
        1910: [1910, 1919],
        1920: [1920, 1929],
        1930: [1930, 1939],
        1940: [1940, 1949],
        1950: [1950, 1959],
        1960: [1960, 1969],
        1970: [1970, 1979],
        1980: [1980, 1989],
        1990: [1990, 1999],
        2000: [2000, 2009],
        2010: [2010, 2019],
        2020: [2020, 2029]
    };
    
    // If we have year-by-year data, calculate decade-specific popularity
    if (nameInfo.years && Array.isArray(nameInfo.years) && nameInfo.years.length > 0) {
        const [decadeStart, decadeEnd] = decadeRanges[decade] || [decade, decade + 9];
        let decadeCount = 0;
        
        // Sum counts for this name in the specified decade
        nameInfo.years.forEach(yearData => {
            const year = parseInt(yearData.year);
            if (year >= decadeStart && year <= decadeEnd) {
                decadeCount += yearData.count || 0;
            }
        });
        
        // Calculate what percentage of total usage this decade represents
        // Normalize to 0-1 scale where 1.0 = very popular in that decade
        if (nameInfo.totalCount > 0) {
            const decadeRatio = decadeCount / nameInfo.totalCount;
            // If the name was used a lot in this decade relative to its total usage, it's popular
            // Average decade would be ~10% of total (1/10 decades), so we scale accordingly
            return Math.min(1.0, decadeRatio * 10); // Scale so 10% = 1.0
        }
    }
    
    // Fallback: use total popularity as a proxy
    if (nameInfo.totalCount > 1000) return 0.8; // Very popular
    if (nameInfo.totalCount > 500) return 0.6;  // Popular
    if (nameInfo.totalCount > 100) return 0.4;  // Somewhat popular
    return 0.2; // Uncommon
}

function matchesCriteria(nameInfo, answers) {
    
    // Gender is a multi_select question, so it arrives as an array even when
    // one option is chosen (selectAnswer is handed Array.from(selectedValues)).
    // Comparing that array to nameInfo.gender with !== was always true, so any
    // answered gender rejected every candidate and the caller fell through to
    // its hardcoded fallback list. Normalise, then test membership.
    const selectedGenders = toArray(answers.gender)
        .map(g => (g === 'PREFER_NOT_TO_SAY' ? 'NB' : g));

    // NB passes through: getCandidates() has already restricted the pool.
    if (selectedGenders.length &&
        !selectedGenders.includes('NB') &&
        !selectedGenders.includes(nameInfo.gender)) {
        return false;
    }

    // Check name length - CRITICAL FILTER
    if (answers.length) {
        const nameLength = nameInfo.name.length;
        if (answers.length === 'short' && nameLength > 4) {
            return false;
        }
        if (answers.length === 'medium' && (nameLength < 5 || nameLength > 6)) {
            return false;
        }
        if (answers.length === 'long' && (nameLength < 7 || nameLength > 9)) {
            return false;
        }
        if (answers.length === 'extra_long' && nameLength < 10) {
            return false;
        }
    }
    
    // VOWEL/CONSONANT: Used for scoring only, not filtering
    // if (answers.starts_with) {
    //     const firstLetter = nameInfo.name.charAt(0).toLowerCase();
    //     const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
    //     if (answers.starts_with === 'vowel' && !isVowel) {
    //         return false;
    //     }
    //     if (answers.starts_with === 'consonant' && isVowel) {
    //         return false;
    //     }
    // }
    
    // POPULARITY: Used for scoring only, not filtering
    // if (answers.popularity) {
    //     const isPopular = nameInfo.totalCount > 500;
    //     const isVeryPopular = nameInfo.totalCount > 800;
    //     
    //     if (answers.popularity === 'very_popular' && !isVeryPopular) return false;
    //     if (answers.popularity === 'popular' && !isPopular) return false;
    //     if (answers.popularity === 'uncommon' && isPopular) return false;
    // }
    
    // RELIGIOUS TRADITION: Used for scoring only, not filtering
    // if (answers.religious_tradition) {
    //     const religiousSelections = Array.isArray(answers.religious_tradition) 
    //         ? answers.religious_tradition 
    //         : [answers.religious_tradition];
    //     
    //     // Filter out "prefer_not_to_say", "none", and "other_spiritual"
    //     const validReligions = religiousSelections.filter(religion => 
    //         religion !== "prefer_not_to_say" && 
    //         religion !== "none" && 
    //         religion !== "other_spiritual"
    //     );
    //     
    //     if (validReligions.length > 0) {
    //         const hasMatch = validReligions.some(religion => 
    //             nameInfo.religions && nameInfo.religions.includes(religion)
    //         );
    //         if (!hasMatch) {
    //             return false;
    //         }
    //     }
    // }
    
    // CULTURAL BACKGROUND: Used for scoring only, not filtering
    // if (answers.cultural_background) {
    //     const culturalSelections = Array.isArray(answers.cultural_background) 
    //         ? answers.cultural_background 
    //         : [answers.cultural_background];
    //     
    //     // Filter out "prefer_not_to_say" and "mixed"
    //     const validCultures = culturalSelections.filter(culture => 
    //         culture !== "prefer_not_to_say" && 
    //         culture !== "mixed"
    //     );
    //     
    //     if (validCultures.length > 0) {
    //         const hasMatch = validCultures.some(culture => 
    //             nameInfo.culturalOrigins && nameInfo.culturalOrigins.includes(culture)
    //         );
    //         if (!hasMatch) {
    //             return false;
    //         }
    //     }
    // }
    
    // BAPTISM/NAMING CEREMONIES: Used for scoring only, not filtering
    // if (answers.baptism_status) {
    //     const baptismSelections = Array.isArray(answers.baptism_status) 
    //         ? answers.baptism_status 
    //         : [answers.baptism_status];
    //     
    //     // Filter out "prefer_not_to_say", "unsure", and "none"
    //     const validCeremonies = baptismSelections.filter(ceremony => 
    //         ceremony !== "prefer_not_to_say" && 
    //         ceremony !== "unsure" && 
    //         ceremony !== "none"
    //     );
    //     
    //     if (validCeremonies.length > 0) {
    //         // Check for religious ceremony matches
    //         const hasReligiousMatch = validCeremonies.some(ceremony => {
    //             if (ceremony === "christian_baptized" && nameInfo.religions && nameInfo.religions.includes("christianity")) {
    //                 return true;
    //             }
    //             if (ceremony === "jewish_naming" && nameInfo.religions && nameInfo.religions.includes("judaism")) {
    //                 return true;
    //             }
    //             if (ceremony === "hindu_naming" && nameInfo.religions && nameInfo.religions.includes("hinduism")) {
    //                 return true;
    //             }
    //             if (ceremony === "islamic_naming" && nameInfo.religions && nameInfo.religions.includes("islam")) {
    //                 return true;
    //             }
    //             if (ceremony === "buddhist_naming" && nameInfo.religions && nameInfo.religions.includes("buddhism")) {
    //                 return true;
    //             }
    //             if (ceremony === "sikh_naming" && nameInfo.religions && nameInfo.religions.includes("sikhism")) {
    //                 return true;
    //             }
    //             return false;
    //         });
    //         
    //         if (hasReligiousMatch) {
    //             // Boost names that match religious ceremonies
    //             return true;
    //         }
    //     }
    // }
    
    // Check state (for now, just return true as we don't have state-specific data)
    if (answers.state) {
        // State filtering could be added here if we had state-specific name data
        // For now, we'll just use it as a general preference
    }
    
    return true;
}

function calculateNameScore(nameInfo, answers) {
    let score = 0;
    
    
    // HIGHEST PRIORITY: Political/Cultural identity (60 points) - NPR research shows this is the strongest predictor
    if (answers.political_values) {
        const politicalSelections = Array.isArray(answers.political_values) 
            ? answers.political_values 
            : [answers.political_values];
        
        // Traditional/conservative values correlate with English names
        const traditionalValues = ['traditional', 'security', 'community'];
        const progressiveValues = ['diverse', 'progressive', 'justice', 'environment'];
        
        const hasTraditionalValues = politicalSelections.some(val => traditionalValues.includes(val));
        const hasProgressiveValues = politicalSelections.some(val => progressiveValues.includes(val));
        
        if (nameInfo.languageOrigin === 'english' && hasTraditionalValues) {
            score += 60; // Strong traditional + English name match
        } else if (nameInfo.languageOrigin !== 'english' && hasProgressiveValues) {
            score += 60; // Strong progressive + non-English name match
        } else if (nameInfo.languageOrigin === 'english' && hasProgressiveValues) {
            score += 30; // Partial match
        } else if (nameInfo.languageOrigin !== 'english' && hasTraditionalValues) {
            score += 20; // Weaker match
        }
    }
    
    // HIGH PRIORITY: Language preference (50 points) - 84% of blue state names are non-English
    if (answers.language_preference) {
        const languageSelections = Array.isArray(answers.language_preference) 
            ? answers.language_preference 
            : [answers.language_preference];
        
        if (languageSelections.includes('english_only') && nameInfo.languageOrigin === 'english') {
            score += 50; // Strong English-only preference match
        } else if (languageSelections.includes('multilingual') && nameInfo.languageOrigin !== 'english') {
            score += 50; // Multilingual preference + non-English name
        } else if (languageSelections.some(lang => lang === nameInfo.languageOrigin)) {
            score += 45; // Direct language match
        } else if (languageSelections.includes('english_only') && nameInfo.languageOrigin !== 'english') {
            score -= 20; // Penalty for mismatch
        }
    }
    
    // HIGH PRIORITY: Cultural/Religious factors (40-50 points) - Still very important
    if (answers.religious_tradition) {
        const religiousSelections = Array.isArray(answers.religious_tradition) 
            ? answers.religious_tradition 
            : [answers.religious_tradition];
        
        const validReligions = religiousSelections.filter(religion => 
            religion !== "prefer_not_to_say" && 
            religion !== "none" && 
            religion !== "other_spiritual"
        );
        
        if (validReligions.length > 0 && nameInfo.religions) {
            const hasReligiousMatch = validReligions.some(religion => 
                nameInfo.religions.includes(religion)
            );
            if (hasReligiousMatch) {
                score += 50; // Strong religious match
            } else if (nameInfo.crossReligious) {
                score += 25; // Cross-religious compatibility
            }
        }
    }
    
    // HIGH PRIORITY: Cultural background (35-45 points) - Major socioeconomic determinant
    if (answers.cultural_background) {
        const culturalSelections = Array.isArray(answers.cultural_background) 
            ? answers.cultural_background 
            : [answers.cultural_background];
        
        const validCultures = culturalSelections.filter(culture => 
            culture !== "prefer_not_to_say" && 
            culture !== "mixed"
        );
        
        if (validCultures.length > 0 && nameInfo.culturalOrigins) {
            const hasCulturalMatch = validCultures.some(culture => 
                nameInfo.culturalOrigins.includes(culture)
            );
            if (hasCulturalMatch) {
                score += 45; // Strong cultural match
            }
        }
    }
    
    // HIGH: Name length (35 points) - Critical user preference that must be respected
    if (answers.length) {
        const nameLength = nameInfo.name.length;
        if (answers.length === 'short' && nameLength <= 4) score += 35;
        else if (answers.length === 'medium' && nameLength >= 5 && nameLength <= 6) score += 35;
        else if (answers.length === 'long' && nameLength >= 7) score += 35;
        else if (answers.length === 'short' && nameLength <= 5) score += 20; // partial match
        else if (answers.length === 'long' && nameLength >= 6) score += 20; // partial match
        else {
            // STRONG PENALTY for length mismatch - this is a critical user preference
            if (answers.length === 'long' && nameLength < 6) score -= 40; // Heavy penalty for long preference getting short name
            else if (answers.length === 'short' && nameLength > 5) score -= 30; // Penalty for short preference getting long name
            else if (answers.length === 'medium' && (nameLength < 4 || nameLength > 7)) score -= 25; // Penalty for medium preference mismatch
        }
    }
    
    // MEDIUM-HIGH: Gender (25 points) - Important demographic factor
    if (answers.gender && 
        answers.gender !== "NB" && 
        nameInfo.gender === answers.gender) {
        score += 25;
    }
    
    // MEDIUM: Popularity with generational trends (20 points) - Enhanced with decade analysis
    if (answers.popularity && answers.decade) {
        const isPopular = nameInfo.totalCount > 500;
        const isVeryPopular = nameInfo.totalCount > 800;
        
        // Check if name was popular in the specified decade
        const decadePopularity = getDecadePopularity(nameInfo, answers.decade);
        
        if (answers.popularity === 'very_popular' && isVeryPopular && decadePopularity > 0.7) score += 20;
        else if (answers.popularity === 'popular' && isPopular && decadePopularity > 0.5) score += 20;
        else if (answers.popularity === 'uncommon' && !isPopular && decadePopularity < 0.3) score += 20;
        else if (answers.popularity === 'very_popular' && isPopular && decadePopularity > 0.5) score += 15; // partial match
        else if (answers.popularity === 'uncommon' && nameInfo.totalCount < 1000 && decadePopularity < 0.5) score += 15; // partial match
    } else if (answers.popularity) {
        // Fallback to original popularity logic if no decade specified
        const isPopular = nameInfo.totalCount > 500;
        const isVeryPopular = nameInfo.totalCount > 800;
        
        if (answers.popularity === 'very_popular' && isVeryPopular) score += 20;
        else if (answers.popularity === 'popular' && isPopular && !isVeryPopular) score += 20;
        else if (answers.popularity === 'uncommon' && !isPopular) score += 20;
        else if (answers.popularity === 'very_popular' && isPopular) score += 10; // partial match
        else if (answers.popularity === 'uncommon' && nameInfo.totalCount < 1000) score += 10; // partial match
    }
    
    // MEDIUM: Vowel/consonant start (15 points) - Name letter effect
    if (answers.starts_with) {
        const firstLetter = nameInfo.name.charAt(0).toLowerCase();
        const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
        if ((answers.starts_with === 'vowel' && isVowel) || 
            (answers.starts_with === 'consonant' && !isVowel)) {
            score += 15;
        }
    }
    
    // NEW: Name letter effect - preference for names starting with letters from their own name
    if (answers.favorite_letter) {
        const nameFirstLetter = nameInfo.name.charAt(0).toLowerCase();
        if (nameFirstLetter === answers.favorite_letter.toLowerCase()) {
            score += 20; // Strong name letter effect
        }
    }
    
    // NEW: Socioeconomic factors based on career/education interests
    if (answers.career_path && nameInfo.socioeconomicLevel) {
        const careerSelections = Array.isArray(answers.career_path) 
            ? answers.career_path 
            : [answers.career_path];
        
        // Higher education careers correlate with traditional/elite names
        const highEducationCareers = ['legal', 'medical', 'science', 'education', 'technology', 'engineering'];
        const hasHighEducationCareer = careerSelections.some(career => 
            highEducationCareers.includes(career)
        );
        
        if (hasHighEducationCareer && nameInfo.socioeconomicLevel === 'high') {
            score += 15;
        } else if (!hasHighEducationCareer && nameInfo.socioeconomicLevel === 'medium') {
            score += 10;
        }
    }
    
    // MEDIUM: Family tradition importance (20 points) - Predicts traditional vs modern names
    if (answers.family_tradition) {
        if (answers.family_tradition >= 2.5 && nameInfo.traditionalSignificance === 'high') {
            score += 20; // Strong traditional match
        } else if (answers.family_tradition <= 1.5 && nameInfo.traditionalSignificance === 'low') {
            score += 20; // Strong modern match
        } else if (answers.family_tradition >= 2.0 && nameInfo.traditionalSignificance === 'medium') {
            score += 15; // Partial traditional match
        } else if (answers.family_tradition <= 2.0 && nameInfo.traditionalSignificance === 'medium') {
            score += 15; // Partial modern match
        }
    }
    
    // MEDIUM: Diversity attitude (15 points) - Correlates with name origin diversity
    if (answers.diversity_attitude) {
        if (answers.diversity_attitude >= 2.5 && nameInfo.languageOrigin !== 'english') {
            score += 15; // High diversity preference + non-English name
        } else if (answers.diversity_attitude <= 1.5 && nameInfo.languageOrigin === 'english') {
            score += 15; // Low diversity preference + English name
        } else if (answers.diversity_attitude >= 2.0 && nameInfo.languageOrigin !== 'english') {
            score += 10; // Partial diversity match
        }
    }
    
    // MEDIUM: Name meaning preference (15 points) - Semantic matching
    if (answers.name_meaning_preference && nameInfo.nameMeaning) {
        const meaningSelections = Array.isArray(answers.name_meaning_preference) 
            ? answers.name_meaning_preference 
            : [answers.name_meaning_preference];
        
        const hasMeaningMatch = meaningSelections.some(meaning => 
            nameInfo.nameMeaning.includes(meaning)
        );
        if (hasMeaningMatch) {
            score += 15; // Name meaning match
        }
    }
    
    // CRITICAL: Rural/Urban factor (30 points) - Namerology research shows rural areas are LEAST traditional
    if (answers.grew_up_location) {
        const locationSelections = Array.isArray(answers.grew_up_location) 
            ? answers.grew_up_location 
            : [answers.grew_up_location];
        
        const isRuralGrewUp = locationSelections.some(loc => 
            ['rural_grew_up', 'agricultural_grew_up'].includes(loc)
        );
        const isUrbanGrewUp = locationSelections.some(loc => 
            ['urban_grew_up', 'international_grew_up'].includes(loc)
        );
        
        // Counterintuitive: Rural areas prefer NON-traditional names, urban areas prefer traditional names
        if (isRuralGrewUp && nameInfo.traditionalSignificance === 'low') {
            score += 30; // Rural + non-traditional name (research-backed)
        } else if (isUrbanGrewUp && nameInfo.traditionalSignificance === 'high') {
            score += 30; // Urban + traditional name (research-backed)
        } else if (isRuralGrewUp && nameInfo.traditionalSignificance === 'medium') {
            score += 20; // Rural + medium traditional
        } else if (isUrbanGrewUp && nameInfo.traditionalSignificance === 'medium') {
            score += 20; // Urban + medium traditional
        } else if (isRuralGrewUp && nameInfo.traditionalSignificance === 'high') {
            score -= 15; // Rural + traditional name (counter to research)
        } else if (isUrbanGrewUp && nameInfo.traditionalSignificance === 'low') {
            score -= 10; // Urban + non-traditional name (counter to research)
        }
    }
    
    // HIGH: Name perception matching (25 points) - How people perceive your name
    if (answers.name_perception && nameInfo.perceivedTraits) {
        const perceptionSelections = Array.isArray(answers.name_perception) 
            ? answers.name_perception 
            : [answers.name_perception];
        
        const hasPerceptionMatch = perceptionSelections.some(perception => 
            nameInfo.perceivedTraits.includes(perception)
        );
        if (hasPerceptionMatch) {
            score += 25; // Strong perception match
        }
    }
    
    // HIGH: Desired impression matching (25 points) - What impression you want to give
    if (answers.desired_impression && nameInfo.desiredTraits) {
        const impressionSelections = Array.isArray(answers.desired_impression) 
            ? answers.desired_impression 
            : [answers.desired_impression];
        
        const hasImpressionMatch = impressionSelections.some(impression => 
            nameInfo.desiredTraits.includes(impression)
        );
        if (hasImpressionMatch) {
            score += 25; // Strong desired impression match
        }
    }
    
    // HIGH: Name reactions matching (25 points) - How people react to your name
    if (answers.name_reactions && nameInfo.typicalReactions) {
        const reactionSelections = Array.isArray(answers.name_reactions) 
            ? answers.name_reactions 
            : [answers.name_reactions];
        
        const hasReactionMatch = reactionSelections.some(reaction => 
            nameInfo.typicalReactions.includes(reaction)
        );
        if (hasReactionMatch) {
            score += 25; // Strong reaction match
        }
    }
    
    // MEDIUM: Community type (15 points) - Geographic correlation
    if (answers.community_type && nameInfo.geographicPreference) {
        const communitySelections = Array.isArray(answers.community_type) 
            ? answers.community_type 
            : [answers.community_type];
        
        const hasCommunityMatch = communitySelections.some(community => 
            nameInfo.geographicPreference.includes(community)
        );
        if (hasCommunityMatch) {
            score += 15; // Community type match
        }
    }
    
    return score;
}

function calculateConfidence(nameInfo, answers, candidates) {
    if (candidates.length === 0) return 25; // Lower base confidence
    if (candidates.length === 1) return 95;
    
    // Base confidence on number of candidates
    let confidence = 50; // Lower base confidence
    if (candidates.length <= 2) confidence = 85;
    else if (candidates.length <= 5) confidence = 75;
    else if (candidates.length <= 10) confidence = 65;
    else if (candidates.length <= 20) confidence = 55;
    
    const topCandidate = candidates[0];
    
    // HIGHEST CONFIDENCE BOOST: Political/cultural identity matches (NPR research shows strongest predictor)
    let politicalCulturalBoost = 0;
    
    // Political values match boost
    if (answers.political_values) {
        const politicalSelections = Array.isArray(answers.political_values) 
            ? answers.political_values 
            : [answers.political_values];
        
        const traditionalValues = ['traditional', 'security', 'community'];
        const progressiveValues = ['diverse', 'progressive', 'justice', 'environment'];
        
        const hasTraditionalValues = politicalSelections.some(val => traditionalValues.includes(val));
        const hasProgressiveValues = politicalSelections.some(val => progressiveValues.includes(val));
        
        if (topCandidate.languageOrigin === 'english' && hasTraditionalValues) {
            politicalCulturalBoost += 25; // Strong traditional + English match
        } else if (topCandidate.languageOrigin !== 'english' && hasProgressiveValues) {
            politicalCulturalBoost += 25; // Strong progressive + non-English match
        }
    }
    
    // Language preference match boost
    if (answers.language_preference) {
        const languageSelections = Array.isArray(answers.language_preference) 
            ? answers.language_preference 
            : [answers.language_preference];
        
        if (languageSelections.includes('english_only') && topCandidate.languageOrigin === 'english') {
            politicalCulturalBoost += 20; // English-only preference match
        } else if (languageSelections.includes('multilingual') && topCandidate.languageOrigin !== 'english') {
            politicalCulturalBoost += 20; // Multilingual + non-English match
        }
    }
    
    // Religious match boost
    if (answers.religious_tradition) {
        const religiousSelections = Array.isArray(answers.religious_tradition) 
            ? answers.religious_tradition 
            : [answers.religious_tradition];
        
        const validReligions = religiousSelections.filter(religion => 
            religion !== "prefer_not_to_say" && 
            religion !== "none" && 
            religion !== "other_spiritual"
        );
        
        if (validReligions.length > 0 && topCandidate.religions) {
            const hasReligiousMatch = validReligions.some(religion => 
                topCandidate.religions.includes(religion)
            );
            if (hasReligiousMatch) {
                politicalCulturalBoost += 15; // Religious match
            }
        }
    }
    
    confidence += politicalCulturalBoost;
    
    // HIGH CONFIDENCE BOOST: Rural/Urban factor (Namerology research)
    let ruralUrbanBoost = 0;
    
    if (answers.grew_up_location) {
        const locationSelections = Array.isArray(answers.grew_up_location) 
            ? answers.grew_up_location 
            : [answers.grew_up_location];
        
        const isRuralGrewUp = locationSelections.some(loc => 
            ['rural_grew_up', 'agricultural_grew_up'].includes(loc)
        );
        const isUrbanGrewUp = locationSelections.some(loc => 
            ['urban_grew_up', 'international_grew_up'].includes(loc)
        );
        
        // Counterintuitive research finding: Rural = non-traditional, Urban = traditional
        if (isRuralGrewUp && topCandidate.traditionalSignificance === 'low') {
            ruralUrbanBoost += 20; // Strong rural + non-traditional match
        } else if (isUrbanGrewUp && topCandidate.traditionalSignificance === 'high') {
            ruralUrbanBoost += 20; // Strong urban + traditional match
        } else if (isRuralGrewUp && topCandidate.traditionalSignificance === 'medium') {
            ruralUrbanBoost += 12; // Partial rural match
        } else if (isUrbanGrewUp && topCandidate.traditionalSignificance === 'medium') {
            ruralUrbanBoost += 12; // Partial urban match
        }
    }
    
    confidence += ruralUrbanBoost;
    
    // MEDIUM CONFIDENCE BOOST: Name letter effect and socioeconomic factors
    let additionalBoost = 0;
    
    // Name letter effect boost
    if (answers.favorite_letter) {
        const nameFirstLetter = topCandidate.name.charAt(0).toLowerCase();
        if (nameFirstLetter === answers.favorite_letter.toLowerCase()) {
            additionalBoost += 10; // Name letter effect
        }
    }
    
    // Socioeconomic match boost
    if (answers.career_path && topCandidate.socioeconomicLevel) {
        const careerSelections = Array.isArray(answers.career_path) 
            ? answers.career_path 
            : [answers.career_path];
        
        const highEducationCareers = ['legal', 'medical', 'science', 'education', 'technology', 'engineering'];
        const hasHighEducationCareer = careerSelections.some(career => 
            highEducationCareers.includes(career)
        );
        
        if (hasHighEducationCareer && topCandidate.socioeconomicLevel === 'high') {
            additionalBoost += 8; // Socioeconomic match
        } else if (!hasHighEducationCareer && topCandidate.socioeconomicLevel === 'medium') {
            additionalBoost += 5;
        }
    }
    
    confidence += additionalBoost;
    
    // HIGH CONFIDENCE BOOST: Name perception factors
    let perceptionBoost = 0;
    
    // Name perception boost
    if (answers.name_perception && topCandidate.perceivedTraits) {
        const perceptionSelections = Array.isArray(answers.name_perception) 
            ? answers.name_perception 
            : [answers.name_perception];
        
        const hasPerceptionMatch = perceptionSelections.some(perception => 
            topCandidate.perceivedTraits.includes(perception)
        );
        if (hasPerceptionMatch) {
            perceptionBoost += 15; // Strong perception match
        }
    }
    
    // Desired impression boost
    if (answers.desired_impression && topCandidate.desiredTraits) {
        const impressionSelections = Array.isArray(answers.desired_impression) 
            ? answers.desired_impression 
            : [answers.desired_impression];
        
        const hasImpressionMatch = impressionSelections.some(impression => 
            topCandidate.desiredTraits.includes(impression)
        );
        if (hasImpressionMatch) {
            perceptionBoost += 15; // Strong desired impression match
        }
    }
    
    // Name reactions boost
    if (answers.name_reactions && topCandidate.typicalReactions) {
        const reactionSelections = Array.isArray(answers.name_reactions) 
            ? answers.name_reactions 
            : [answers.name_reactions];
        
        const hasReactionMatch = reactionSelections.some(reaction => 
            topCandidate.typicalReactions.includes(reaction)
        );
        if (hasReactionMatch) {
            perceptionBoost += 15; // Strong reaction match
        }
    }
    
    confidence += perceptionBoost;
    
    // LOWER CONFIDENCE BOOST: Other factors
    if (answers.length && topCandidate.name) {
        const nameLength = topCandidate.name.length;
        if ((answers.length === 'short' && nameLength <= 4) ||
            (answers.length === 'medium' && nameLength >= 5 && nameLength <= 6) ||
            (answers.length === 'long' && nameLength >= 7)) {
            confidence += 5; // Length match
        }
    }
    
    if (answers.starts_with && topCandidate.name) {
        const firstLetter = topCandidate.name.charAt(0).toLowerCase();
        const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
        if ((answers.starts_with === 'vowel' && isVowel) || 
            (answers.starts_with === 'consonant' && !isVowel)) {
            confidence += 3; // Vowel/consonant match
        }
    }
    
    return Math.min(confidence, 95); // Cap at 95%
}

const nameScoringApi = { getDecadePopularity, matchesCriteria, calculateNameScore, calculateConfidence };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = nameScoringApi;
}
if (typeof window !== 'undefined') {
    window.NameScoring = nameScoringApi;
}
