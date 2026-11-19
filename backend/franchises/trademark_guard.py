import re
import difflib
from typing import Optional, Dict, Any, List

LEGAL_STOPWORDS = {
    'pvt', 'ltd', 'private', 'limited', 'llp', 'inc', 'corp', 'corporation',
    'co', 'company', 'enterprises', 'enterprise', 'the', 'and', 'franchise',
    'franchises', 'group', 'india', 'global', 'international', 'holdings',
    'solutions', 'services', 'systems', 'network', 'chain', 'hub', 'brand',
    'brands', 'lounge', 'center', 'centre', 'academy', 'gym', 'fitness',
    'store', 'stores', 'outlet', 'outlets', 'shop', 'shops'
}

# Recognized protected trademarks to prevent domain/brand piracy & trademark squatting
BASELINE_PROTECTED_BRANDS = [
    "Kentucky Fried Chicken",
    "KFC",
    "McDonald's",
    "Starbucks",
    "Subway",
    "Burger King",
    "Domino's Pizza",
    "Pizza Hut",
    "Dunkin'",
    "Taco Bell",
    "Baskin Robbins",
    "Cafe Coffee Day",
    "Chai Point",
    "Chaayos",
    "Haldiram's",
    "Barbeque Nation",
    "Tim Hortons",
    "Chipotle Mexican Grill",
    "Wendy's",
    "Krispy Kreme",
    "Nando's",
    "Costa Coffee",
    "Cinnabon",
    "Papa John's",
    "Gold's Gym",
    "Anytime Fitness",
    "Cult.fit",
    "Lenskart",
    "Apollo Pharmacy",
    "Dr Lal PathLabs"
]

def clean_tokens(text: str) -> List[str]:
    """Tokenize text into lower-case alphanumeric tokens excluding legal stop words."""
    tokens = re.findall(r'[a-zA-Z0-9]+', text.lower())
    return [t for t in tokens if t not in LEGAL_STOPWORDS]

def all_word_tokens(text: str) -> List[str]:
    """All lower-case alphanumeric word tokens."""
    return re.findall(r'[a-zA-Z0-9]+', text.lower())

def extract_acronym(tokens: List[str]) -> str:
    """Derive acronym initialism from list of tokens."""
    return "".join(t[0] for t in tokens if t)

def check_brand_similarity(candidate_name: str, existing_names: List[str]) -> Optional[Dict[str, Any]]:
    """
    Evaluates whether candidate_name conflicts with any brand in existing_names
    under Trademark & Copyright protection standards:
    1. Exact / Normalized Match
    2. Acronym & Initialism Cross-Match (e.g. KFC <-> Kentucky Fried Chicken)
    3. Compound Prefix / Core Trademark Collision (e.g. Iron Pulse vs IronPulse)
    4. Fuzzy Levenshtein / Sequence distance on distinct brand roots (Typosquatting)
    5. Token Subset Overlap
    6. Sequence similarity ratio >= 78%
    """
    candidate_name = candidate_name.strip()
    if not candidate_name:
        return None

    cand_tokens = clean_tokens(candidate_name)
    all_cand = all_word_tokens(candidate_name)
    if not all_cand:
        return None

    cand_norm = " ".join(cand_tokens) if cand_tokens else " ".join(all_cand)
    cand_compressed = "".join(cand_tokens) if cand_tokens else "".join(all_cand)
    all_cand_compressed = "".join(all_cand)

    cand_acronym_stopwords = extract_acronym(cand_tokens) if cand_tokens else ""
    cand_acronym_all = extract_acronym(all_cand)

    for exist_name in existing_names:
        exist_name_clean = exist_name.strip()
        if not exist_name_clean:
            continue

        ex_tokens = clean_tokens(exist_name_clean)
        all_ex = all_word_tokens(exist_name_clean)
        if not all_ex:
            continue

        ex_norm = " ".join(ex_tokens) if ex_tokens else " ".join(all_ex)
        ex_compressed = "".join(ex_tokens) if ex_tokens else "".join(all_ex)
        all_ex_compressed = "".join(all_ex)

        ex_acronym_stopwords = extract_acronym(ex_tokens) if ex_tokens else ""
        ex_acronym_all = extract_acronym(all_ex)

        # 1. Exact or Compressed Match
        if all_cand_compressed == all_ex_compressed or cand_compressed == ex_compressed:
            return {
                'conflict': True,
                'existing_name': exist_name,
                'reason': 'Direct Trademark Collision',
                'description': f'Exact match with registered trademark/brand "{exist_name}".'
            }

        # 2. Acronym Cross-Match (e.g., KFC vs Kentucky Fried Chicken)
        cand_short = all_cand_compressed
        if len(cand_short) in [2, 3, 4, 5]:
            if cand_short in [ex_acronym_all, ex_acronym_stopwords]:
                return {
                    'conflict': True,
                    'existing_name': exist_name,
                    'reason': 'Acronym Trademark Infringement',
                    'description': f'"{candidate_name.upper()}" is the registered commercial acronym for "{exist_name}".'
                }

        ex_short = all_ex_compressed
        if len(ex_short) in [2, 3, 4, 5]:
            if ex_short in [cand_acronym_all, cand_acronym_stopwords]:
                return {
                    'conflict': True,
                    'existing_name': exist_name,
                    'reason': 'Acronym Trademark Infringement',
                    'description': f'"{candidate_name}" expands registered trademark acronym "{exist_name}".'
                }

        # Multi-word matching acronyms (e.g. K.F.C. vs Kentucky Fried Chicken)
        if len(cand_acronym_stopwords) >= 3 and cand_acronym_stopwords == ex_acronym_stopwords:
            return {
                'conflict': True,
                'existing_name': exist_name,
                'reason': 'Acronym Identifier Collision',
                'description': f'Shares acronym identifier "{cand_acronym_stopwords.upper()}" with "{exist_name}".'
            }

        # 3. Compound / Prefix Brand Collision (e.g. "Iron Pulse" vs "IronPulse")
        cand_lead_token = cand_tokens[0] if cand_tokens else all_cand[0]
        ex_lead_token = ex_tokens[0] if ex_tokens else all_ex[0]

        cand_two_lead = "".join(all_cand[:2])
        ex_two_lead = "".join(all_ex[:2])
        if (len(cand_two_lead) >= 6 and (cand_two_lead == ex_lead_token or cand_two_lead == ex_two_lead)) or \
           (len(ex_two_lead) >= 6 and (ex_two_lead == cand_lead_token or ex_two_lead == cand_two_lead)):
            return {
                'conflict': True,
                'existing_name': exist_name,
                'reason': 'Core Brand Name Collision',
                'description': f'Shares core proprietary brand root with registered brand "{exist_name}".'
            }

        # 4. Primary Distinctive Token Similarity (Fuzzy & Exact)
        if len(cand_lead_token) >= 4 and len(ex_lead_token) >= 4:
            if cand_lead_token == ex_lead_token:
                return {
                    'conflict': True,
                    'existing_name': exist_name,
                    'reason': 'Core Brand Collision',
                    'description': f'Shares distinctive trademark root "{cand_lead_token.title()}" with registered brand "{exist_name}".'
                }

            # SequenceMatcher ratio >= 0.78 (Catches typosquatting like BrewCraft vs BrewKraft)
            ratio_lead = difflib.SequenceMatcher(None, cand_lead_token, ex_lead_token).ratio()
            if ratio_lead >= 0.78:
                return {
                    'conflict': True,
                    'existing_name': exist_name,
                    'reason': 'Deceptive Similarity / Typosquatting',
                    'description': f'Brand root "{cand_lead_token}" is deceptively similar ({round(ratio_lead * 100)}% match) to registered brand "{exist_name}".'
                }

        # 5. Token Subset Overlap (e.g. "BrewCraft Specialty Coffee Lounge" vs "BrewCraft Coffee")
        cand_set = set(cand_tokens if cand_tokens else all_cand)
        ex_set = set(ex_tokens if ex_tokens else all_ex)
        common = cand_set.intersection(ex_set)
        if len(common) >= 2 and (len(common) / len(cand_set) >= 0.6 or len(common) / len(ex_set) >= 0.6):
            return {
                'conflict': True,
                'existing_name': exist_name,
                'reason': 'Substantial Trademark Overlap',
                'description': f'Substantial overlapping terms with registered brand "{exist_name}".'
            }

        # 6. Overall String Sequence Similarity
        ratio_norm = difflib.SequenceMatcher(None, cand_norm, ex_norm).ratio()
        if ratio_norm >= 0.78:
            return {
                'conflict': True,
                'existing_name': exist_name,
                'reason': 'High Visual & Phonetic Similarity',
                'description': f'Brand name is {round(ratio_norm * 100)}% similar to registered brand "{exist_name}".'
            }

    return None

def check_brand_copyright_conflict(candidate_name: str, exclude_listing_id: Optional[int] = None, exclude_user_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
    """
    Checks candidate_name against:
    - All FranchiseListing names in DB
    - All FranchiserProfile company_name entries in DB (excluding current user's profile)
    - Baseline protected brand catalog
    """
    if not candidate_name or not candidate_name.strip():
        return None

    from .models import FranchiseListing, FranchiserProfile

    existing_names: List[str] = list(BASELINE_PROTECTED_BRANDS)

    listings_qs = FranchiseListing.objects.all()
    if exclude_listing_id:
        listings_qs = listings_qs.exclude(id=exclude_listing_id)
    if exclude_user_id:
        listings_qs = listings_qs.exclude(franchiser_id=exclude_user_id)
    
    existing_names.extend(listings_qs.values_list('name', flat=True))

    profile_qs = FranchiserProfile.objects.exclude(company_name='')
    if exclude_user_id:
        profile_qs = profile_qs.exclude(user_id=exclude_user_id)
    profile_names = profile_qs.values_list('company_name', flat=True)
    existing_names.extend(profile_names)

    # Deduplicate while preserving non-empty names
    unique_names = list(dict.fromkeys([n for n in existing_names if n and n.strip()]))

    return check_brand_similarity(candidate_name, unique_names)
