import type {
  AdminVerificationCheck,
  EvidenceProvenance,
  VerificationApplicability,
  VerificationStatus,
} from "./contracts";

export type CheckGuidance = Readonly<{
  title: string;
  shortSummary: string;
  purpose: string;
  checklist: readonly string[];
  suggestedDocuments: readonly string[];
}>;

export const DEFAULT_CHECK_GUIDANCE: CheckGuidance = {
  title: "Property check",
  shortSummary: "Confirm that the recorded details match the property being listed.",
  purpose: "Verify the property documentation and details against recorded sources.",
  checklist: [
    "Review supporting documents for accuracy",
    "Confirm parcel and owner correspondence",
    "Verify against official sources where required",
  ],
  suggestedDocuments: ["Official property records", "Owner documents", "Registered certificates"],
};

export const CHECK_GUIDANCE: Record<string, CheckGuidance> = {
  PROPERTY_IDENTITY_REVIEWED: {
    title: "Property identity",
    shortSummary:
      "Confirm that the survey/block references and location belong to the property being listed.",
    purpose:
      "We need to confirm that the survey/block references, village, and ownership details correspond to the land being listed.",
    checklist: [
      "Compare survey / block number against owner records",
      "Compare village, taluka, and district references",
      "Confirm owner or recorded holder name correspondence",
      "Verify that parcel references match the listing intake details",
    ],
    suggestedDocuments: [
      "7/12 extract",
      "Title deed / sale deed",
      "Property tax receipt",
      "Owner identity documentation",
    ],
  },

  REVENUE_RECORDS_REVIEWED: {
    title: "Revenue records",
    shortSummary: "Confirm that current revenue records correspond to this agricultural property.",
    purpose:
      "We need to confirm that the revenue records received correspond to the land being listed and reflect current entries.",
    checklist: [
      "Confirm survey / block number matches the listing",
      "Confirm village and revenue circle match the listing location",
      "Check recorded landholders and khata number",
      "Check for recent mutation entries or tenure endorsements",
      "Verify against official portal (AnyRoR) where required",
    ],
    suggestedDocuments: [
      "7/12 (VF-7)",
      "8A (VF-8A)",
      "AnyRoR official extract",
      "Revenue register extract",
    ],
  },

  LOCATION_REVIEWED: {
    title: "Location correspondence",
    shortSummary:
      "Confirm property location correspondence against satellite maps and access corridors.",
    purpose:
      "Confirm that the physical location and surrounding landmarks correspond to the documented land parcel.",
    checklist: [
      "Cross-check GPS coordinates or pin against satellite imagery",
      "Verify village boundaries and approach road alignment",
      "Confirm prominent landmarks mentioned in listing",
    ],
    suggestedDocuments: [
      "Satellite location map",
      "Site observation report",
      "Village revenue map",
    ],
  },

  SITE_VISIT_COMPLETED: {
    title: "Site visit observation",
    shortSummary: "Record physical site visit observation and ground condition proof.",
    purpose:
      "Record an in-person physical inspection of the land to confirm ground conditions, occupancy, and physical access.",
    checklist: [
      "Confirm date of physical site visit",
      "Record ground conditions (flat, sloping, vegetation, water bodies)",
      "Note existing boundary markers, fencing, or encroachments",
      "Capture clear geotagged photographs of the parcel",
    ],
    suggestedDocuments: [
      "Site visit photos",
      "Site observation report",
      "Field inspection checklist",
    ],
  },

  ACCESS_EVIDENCE_REVIEWED: {
    title: "Road access & frontage",
    shortSummary: "Review access road approach and road frontage evidence.",
    purpose:
      "Confirm whether the land has recorded road access, direct road frontage, or an approach easement.",
    checklist: [
      "Check whether road is National Highway, State Highway, Panchayat road, or field approach",
      "Confirm documented width and surface condition (tar, metal, dirt)",
      "Confirm if access is through private right-of-way or public road",
    ],
    suggestedDocuments: [
      "Site access photos",
      "Revenue village map showing roads",
      "Surveyor approach report",
    ],
  },

  REGISTRATION_RECORDS_REVIEWED: {
    title: "Registration records / Index-2",
    shortSummary: "Review registered deed and Index-2 records for the parcel.",
    purpose:
      "Check official sub-registrar deed records (Index-2) for previous transactions involving this parcel.",
    checklist: [
      "Verify Index-2 extract from the Sub-Registrar Office (Garvi portal)",
      "Check last registered sale deed or transfer instrument",
      "Verify registration volume, page, and deed numbers",
      "Confirm parties named in the deed match the recorded holder",
    ],
    suggestedDocuments: [
      "Index-2 extract",
      "Registered Sale Deed / Gift Deed",
      "Sub-Registrar search receipt",
    ],
  },

  ENCUMBRANCE_SEARCH_REVIEWED: {
    title: "Encumbrance search",
    shortSummary: "Review official search sources for registered mortgages or encumbrances.",
    purpose:
      "Check recorded search sources for registered mortgages, bank charges, or other encumbrances over the documented search period.",
    checklist: [
      "Review Sub-Registrar / CERSAI encumbrance certificate (Nil Encumbrance / Search Report)",
      "Verify the documented search period (typically 13 to 30 years)",
      "Check for any outstanding bank loan charges or hypothecations",
    ],
    suggestedDocuments: [
      "Encumbrance Certificate (EC)",
      "CERSAI search report",
      "Advocate search receipt",
    ],
  },

  LITIGATION_SCREENING_REVIEWED: {
    title: "Litigation screening",
    shortSummary: "Screen district court and revenue tribunal registries for active disputes.",
    purpose:
      "Screen court and revenue tribunal databases for active disputes, pending appeals, or injunctions involving the parcel or owners.",
    checklist: [
      "Search e-Courts database for district and civil court cases",
      "Check Gujarat Revenue Tribunal (GRT) and Collector court registers",
      "Confirm no pending stay orders or status-quo injunctions",
    ],
    suggestedDocuments: [
      "e-Courts search printout",
      "Revenue tribunal case search",
      "Advocate litigation search letter",
    ],
  },

  LEGAL_REVIEW_COMPLETED: {
    title: "Professional legal review",
    shortSummary: "Review scoped legal title opinion prepared by a qualified advocate.",
    purpose:
      "Commission and review a formal legal title opinion from an independent advocate on record.",
    checklist: [
      "Confirm advocate's name, bar council enrollment, and date of opinion",
      "Review chain of title documents evaluated by advocate",
      "Confirm advocate's findings on marketability and specific limitations",
    ],
    suggestedDocuments: [
      "Legal Title Search Report",
      "Advocate Title Certificate",
      "Legal Opinion Document",
    ],
  },

  SURVEYOR_REVIEW_COMPLETED: {
    title: "Surveyor boundary review",
    shortSummary: "Review physical measurement and boundary report by a licensed surveyor.",
    purpose:
      "Review boundary measurements, total area confirmation, and physical markers certified by a licensed surveyor.",
    checklist: [
      "Confirm surveyor's license and credential details",
      "Compare measured physical area against revenue record area",
      "Check boundary dimensions on all four sides (North, South, East, West)",
    ],
    suggestedDocuments: [
      "Licensed Surveyor Report",
      "Site measurement drawing",
      "DILR survey verification",
    ],
  },

  PLANNING_REVIEW_COMPLETED: {
    title: "Planning authority review",
    shortSummary: "Review zoning and DP/TP reservation status with the planning authority.",
    purpose:
      "Confirm the land's zoning and reservations under the local urban development authority (AUDA, GUDA, etc.).",
    checklist: [
      "Check Development Plan (DP) zoning (e.g., Agricultural, Residential, Commercial)",
      "Confirm if parcel falls in Town Planning (TP) scheme area",
      "Check for road widening or public reservation deductions",
    ],
    suggestedDocuments: ["Zoning certificate", "DP zoning map extract", "TP scheme plan"],
  },

  VF7_REVIEWED: {
    title: "7/12 land record (VF-7)",
    shortSummary:
      "Review Village Form 7 tenure details, occupant rights, and encumbrance endorsements.",
    purpose:
      "Review the primary agricultural land title extract (Village Form 7) for tenure type and recorded occupants.",
    checklist: [
      "Confirm survey / block number matches property",
      "Check tenure type (Old Tenure / New Tenure / Restricted)",
      "Check occupant (Khatedar) names and their share",
      "Review 'Other Rights' column for liabilities, bank charges, or tenancy claims",
    ],
    suggestedDocuments: ["7/12 extract (AnyRoR signed / certified)", "VF-7 printout"],
  },

  VF8A_REVIEWED: {
    title: "8A khata record (VF-8A)",
    shortSummary: "Review Village Form 8-A khata account and registered landholder references.",
    purpose:
      "Review Village Form 8A holding details to confirm total land holdings and land revenue assessment.",
    checklist: [
      "Confirm khata number matches the 7/12 record",
      "Confirm all survey numbers grouped under this khata account",
      "Verify total land area held by the recorded farmer / owner",
    ],
    suggestedDocuments: ["8A khata extract (AnyRoR / e-Dhara)", "VF-8A official copy"],
  },

  VF6_MUTATION_REVIEWED: {
    title: "Mutation entries (VF-6)",
    shortSummary: "Review Village Form 6 mutation history entries for parcel succession.",
    purpose:
      "Examine historical mutation entries (Hakk Patrak) to verify how current owners acquired the land (inheritance, sale, partition).",
    checklist: [
      "Check recent mutation entry numbers endorsed on the 7/12",
      "Verify whether mutation entries are certified or pending notice (Panchrojkam)",
      "Verify succession chain from previous owners to current holders",
    ],
    suggestedDocuments: ["VF-6 Mutation extracts", "Certified mutation register copy"],
  },

  TENURE_RESTRICTION_REVIEWED: {
    title: "Tenure & transfer restrictions",
    shortSummary:
      "Review tenure conditions (Old / New tenure) and applicable transfer restrictions.",
    purpose:
      "Check whether the land has restrictions under Bombay Tenancy Act (Section 43, 63, or 73AA tribal land restrictions).",
    checklist: [
      "Determine if land is Old Tenure (free transfer) or New Tenure (requires Collector permission)",
      "Check for Section 43 / 63 farmer eligibility requirements",
      "Check for Section 73AA restrictions regarding tribal land transfers",
    ],
    suggestedDocuments: [
      "Tenure verification certificate",
      "Collector premium receipt (if converted to Old Tenure)",
      "Legal opinion on tenure",
    ],
  },

  SURVEY_MAPNI_EVIDENCE_REVIEWED: {
    title: "Survey / Mapni records",
    shortSummary: "Review available DILR survey and mapni records for parcel correspondence.",
    purpose:
      "Review District Inspector of Land Records (DILR) mapni and tipan sheets to verify official survey boundaries.",
    checklist: [
      "Check official DILR tipan sheet or village map extract",
      "Confirm survey boundaries correspond to natural landmarks",
      "Check if any survey dispute or boundary re-measurement is pending",
    ],
    suggestedDocuments: [
      "DILR tipan sheet",
      "Official village survey map",
      "Government measurement receipt",
    ],
  },

  NA_ORDER_REVIEWED: {
    title: "NA conversion order",
    shortSummary: "Review official Collector Non-Agricultural (NA) permission order.",
    purpose:
      "Confirm that agricultural land was legally converted to Non-Agricultural status with a valid Collector order.",
    checklist: [
      "Verify Collector order number, dispatch date, and sanction authority",
      "Check survey numbers and area covered under the NA order",
      "Verify that conversion premium / challan was paid in full",
    ],
    suggestedDocuments: [
      "Collector NA Order",
      "Challan payment receipt for NA premium",
      "Sanctioned layout plan",
    ],
  },

  NA_PURPOSE_REVIEWED: {
    title: "NA permitted use purpose",
    shortSummary: "Review permitted NA use purpose in the Collector order.",
    purpose:
      "Confirm the exact permitted category of Non-Agricultural use (Residential, Commercial, Industrial, or Warehousing).",
    checklist: [
      "Check permitted purpose in the order: Residential (R), Commercial (C), or Industrial (I)",
      "Confirm proposed use aligns with the granted NA permission",
      "Check validity period and construction timeline conditions",
    ],
    suggestedDocuments: ["Collector NA Order (clauses section)", "Layout approval copy"],
  },

  PLANNING_CHECK_REVIEWED: {
    title: "Zoning & planning check",
    shortSummary: "Review planning authority DP/TP zoning status and road reservations.",
    purpose:
      "Confirm that NA land complies with master plan zoning and development control regulations.",
    checklist: [
      "Check zoning classification in current Development Plan (AUDA/GUDA/municipal)",
      "Verify distance from protected corridors, water bodies, or green belts",
      "Confirm whether layout complies with standard planning bylaws",
    ],
    suggestedDocuments: ["Planning authority zoning certificate", "DP master plan extract"],
  },

  TP_FP_OP_REVIEWED: {
    title: "Town Planning scheme (OP/FP)",
    shortSummary: "Review TP scheme Original Plot (OP) and Final Plot (FP) allocation.",
    purpose:
      "Check whether land has Town Planning scheme allocation, with Original Plot (OP) deducted and Final Plot (FP) assigned.",
    checklist: [
      "Verify OP (Original Plot) number and original land area",
      "Verify FP (Final Plot) number and net allotted area after standard deduction",
      "Confirm whether TP scheme is Draft, Preliminary, or Final sanctioned",
    ],
    suggestedDocuments: [
      "Form F extract",
      "TP scheme layout map showing FP",
      "AUDA/GUDA allocation letter",
    ],
  },

  DEVELOPMENT_PERMISSION_REVIEWED: {
    title: "Development permission / Rajachithi",
    shortSummary: "Review Rajachithi development permission and approved building layout.",
    purpose:
      "Check whether competent authority has sanctioned development permission (Rajachithi) and approved layout drawings.",
    checklist: [
      "Verify Rajachithi / Vikas Parvangi order number and date",
      "Check approved Floor Space Index (FSI) and building height limits",
      "Verify whether Commencement Certificate (CC) has been issued",
    ],
    suggestedDocuments: [
      "Rajachithi / Development Permission",
      "Approved layout drawings",
      "Commencement Certificate",
    ],
  },

  INDUSTRIAL_DESIGNATION_REVIEWED: {
    title: "Industrial designation",
    shortSummary:
      "Review industrial estate designation and approved manufacturing/warehousing land use.",
    purpose:
      "Confirm whether the property has valid legal designation for industrial manufacturing, processing, or warehousing.",
    checklist: [
      "Verify industrial zoning notification or estate notification",
      "Check permissible industrial categories (Red, Orange, Green, White)",
      "Confirm Pollution Control Board (GPCB) zone compatibility",
    ],
    suggestedDocuments: [
      "Industrial estate notification",
      "GPCB zoning clearance",
      "Collector industrial permission",
    ],
  },

  GIDC_RECORDS_REVIEWED: {
    title: "GIDC records",
    shortSummary: "Review GIDC allotment letter, plot boundary plan, and transfer guidelines.",
    purpose:
      "Confirm that plot belongs to Gujarat Industrial Development Corporation (GIDC) estate with valid allotment documentation.",
    checklist: [
      "Verify GIDC estate name and plot number",
      "Confirm original allottee name and current possession holder",
      "Verify GIDC plot boundary plan matches physical boundaries",
    ],
    suggestedDocuments: ["GIDC Allotment Letter", "GIDC possession receipt", "GIDC plot plan"],
  },

  GIDC_ALLOTMENT_REVIEWED: {
    title: "GIDC allotment order",
    shortSummary: "Review original GIDC plot allotment order and terms of initial possession.",
    purpose:
      "Review the initial GIDC allotment order, payment of development charges, and fulfillment of allotment terms.",
    checklist: [
      "Verify allotment letter date and plot dimensions",
      "Check payment status of all installments and development charges",
      "Verify that allotment has not been cancelled for non-performance",
    ],
    suggestedDocuments: [
      "GIDC Allotment Order",
      "Payment completion certificate",
      "GIDC no-due letter",
    ],
  },

  GIDC_LEASE_REVIEWED: {
    title: "GIDC lease deed (99 years)",
    shortSummary: "Review GIDC 99-year lease agreement and annual lease rent compliance.",
    purpose:
      "Review the registered 99-year lease deed between GIDC and the plot holder, including lease rent compliance.",
    checklist: [
      "Verify registered GIDC Lease Deed date, duration, and expiration",
      "Check whether annual lease rent is paid up to date",
      "Confirm lessee name corresponds to seller",
    ],
    suggestedDocuments: [
      "Registered GIDC Lease Deed",
      "Latest GIDC lease rent receipt",
      "GIDC rent statement",
    ],
  },

  GIDC_TRANSFER_REVIEWED: {
    title: "GIDC transfer status / NOC",
    shortSummary: "Review GIDC transfer permission and NOC requirements.",
    purpose:
      "Review GIDC requirements for transfer, subletting, or change in constitution, including applicable transfer fees.",
    checklist: [
      "Confirm whether GIDC Transfer Permission / NOC is required for the transaction",
      "Check calculation of GIDC transfer fee / penalty status",
      "Confirm whether any previous transfer approval is pending regularisation",
    ],
    suggestedDocuments: [
      "GIDC Transfer Permission / NOC",
      "GIDC transfer fee challan",
      "GIDC tripartite agreement copy",
    ],
  },

  GIDC_USE_COMPLIANCE_REVIEWED: {
    title: "GIDC use compliance",
    shortSummary: "Review proposed industrial activity against GIDC approved use categories.",
    purpose:
      "Check whether the permitted industry category under GIDC allotment matches the buyer's intended manufacturing use.",
    checklist: [
      "Check approved industrial category in original allotment",
      "Verify whether change of activity permission has been obtained if needed",
      "Verify compliance with GIDC effluent disposal rules",
    ],
    suggestedDocuments: [
      "GIDC approved use certificate",
      "GPCB Consent to Establish (CTE)",
      "Activity permission letter",
    ],
  },
};

export function getCheckGuidance(code: string): CheckGuidance {
  return CHECK_GUIDANCE[code] ?? DEFAULT_CHECK_GUIDANCE;
}

export function formatStatusLabel(status: VerificationStatus): string {
  switch (status) {
    case "NOT_STARTED":
      return "Not started";
    case "IN_REVIEW":
      return "In review";
    case "PASSED":
      return "Complete";
    case "PASSED_WITH_NOTE":
      return "Complete — note attached";
    case "FAILED":
      return "Issue found";
    case "REQUIRES_REVIEW":
      return "Needs review";
    case "EXPIRED":
      return "Review expired";
    default:
      return status;
  }
}

export function formatProvenanceLabel(provenance: EvidenceProvenance): string {
  switch (provenance) {
    case "RECEIVED":
      return "Document received";
    case "REVIEWED":
      return "Document reviewed";
    case "SOURCE_VERIFIED":
      return "Checked against official source";
    case "PROFESSIONALLY_REVIEWED":
      return "Reviewed by a professional";
    case "SUPERSEDED":
      return "Superseded";
    case "REVOKED":
      return "Revoked";
    default:
      return provenance;
  }
}

export function formatApplicabilityLabel(applicability: VerificationApplicability): string {
  switch (applicability) {
    case "APPLICABLE":
      return "Relevant for this property";
    case "NOT_APPLICABLE":
      return "Not relevant";
    case "UNDETERMINED":
      return "Under evaluation";
    default:
      return applicability;
  }
}

export function formatEvidenceTypeLabel(type: string): string {
  switch (type) {
    case "OWNER_DOCUMENT":
      return "Owner-provided document";
    case "OFFICIAL_RECORD":
      return "Official land record";
    case "CERTIFIED_OFFICIAL_RECORD":
      return "Certified official record";
    case "OFFICIAL_PORTAL_RESULT":
      return "Official portal result (AnyRoR / Garvi)";
    case "OFFICIAL_SEARCH_RESULT":
      return "Official search certificate";
    case "REGISTERED_INSTRUMENT":
      return "Registered deed / instrument";
    case "AUTHORITY_ORDER":
      return "Government / Collector order";
    case "AUTHORITY_LETTER":
      return "Authority permission letter";
    case "COURT_OR_REVENUE_SEARCH":
      return "Court or revenue tribunal search";
    case "SITE_OBSERVATION":
      return "Site visit observation";
    case "SURVEY_MAP":
      return "Survey map / revenue map";
    case "MAPNI_RECORD":
      return "Official mapni / tipan record";
    case "PROFESSIONAL_REPORT":
      return "Professional title or survey report";
    case "PROFESSIONAL_OPINION":
      return "Advocate legal opinion";
    case "PHOTOGRAPHIC_OBSERVATION":
      return "Photographic proof";
    default:
      return type.replaceAll("_", " ").toLowerCase();
  }
}

export type NextAction = Readonly<{
  text: string;
  isComplete: boolean;
  stepTarget: number; // 1: Explain, 2: Proof, 3: Method, 4: Outcome, 5: Save
}>;

/**
 * Computes exactly ONE next action for an administrator.
 */
export function getCheckNextAction(
  check: AdminVerificationCheck,
  isRequiredForPublication: boolean,
): NextAction {
  // If check passed
  if (check.status === "PASSED" || check.status === "PASSED_WITH_NOTE") {
    return {
      text: "Complete.",
      isComplete: true,
      stepTarget: 5,
    };
  }

  // If check has open blocking issues
  const openBlockingIssues = check.exceptions.filter(
    (e) => e.status === "OPEN" && e.blocksPublicDisclosure,
  );
  if (openBlockingIssues.length > 0) {
    return {
      text: "Next: Resolve the recorded issue.",
      isComplete: false,
      stepTarget: 4,
    };
  }

  // If professional review is required and incomplete
  const needsProfessional =
    check.definition.lawyerRequired || check.definition.surveyorRequired || check.referralRequired;
  const completedProfessional = check.professionalReviews.some((r) => r.status === "COMPLETED");
  if (needsProfessional && !completedProfessional) {
    return {
      text: "Next: Request professional review.",
      isComplete: false,
      stepTarget: 4,
    };
  }

  // Check evidence
  const activeEvidence = check.evidence.filter(
    (e) => e.supportsCheck && !["SUPERSEDED", "REVOKED"].includes(e.provenance),
  );

  if (activeEvidence.length === 0) {
    return {
      text: "Next: Add a supporting document.",
      isComplete: false,
      stepTarget: 2,
    };
  }

  // Has evidence, check provenance
  const hasOnlyReceived = activeEvidence.every((e) => e.provenance === "RECEIVED");
  if (hasOnlyReceived) {
    return {
      text: "Next: Review the document.",
      isComplete: false,
      stepTarget: 3,
    };
  }

  // If minimum provenance is SOURCE_VERIFIED but highest is only REVIEWED
  const minIsSourceVerified =
    check.definition.minimumProvenance === "SOURCE_VERIFIED" ||
    (isRequiredForPublication && check.definition.code === "REVENUE_RECORDS_REVIEWED");
  const hasSourceVerified = activeEvidence.some(
    (e) => e.provenance === "SOURCE_VERIFIED" || e.provenance === "PROFESSIONALLY_REVIEWED",
  );

  if (minIsSourceVerified && !hasSourceVerified) {
    return {
      text: "Next: Check this information against an official source.",
      isComplete: false,
      stepTarget: 3,
    };
  }

  // Evidence is valid, but outcome is not recorded or check is in review / failed
  return {
    text: "Next: Record what you found.",
    isComplete: false,
    stepTarget: 4,
  };
}

/**
 * Translates server/database validation errors into teaching, supportive guidance for admins.
 */
export function formatTeachingError(errorMessage: string): string {
  if (/scope.*20 characters/i.test(errorMessage)) {
    return "Briefly describe what you checked before saving (minimum 20 characters).";
  }
  if (/current eligible evidence.*required provenance/i.test(errorMessage)) {
    return "You're almost done. This check requires confirmation against an official source before it can pass.";
  }
  if (/resolve disclosure-blocking exceptions/i.test(errorMessage)) {
    return "Please resolve recorded issues before completing this check.";
  }
  if (/required scoped professional review is incomplete/i.test(errorMessage)) {
    return "A completed professional review is required before this check can pass.";
  }
  if (/passed with note requires an explicit note/i.test(errorMessage)) {
    return "Please add a brief note explaining what needs attention.";
  }
  if (/only applicable checks can transition/i.test(errorMessage)) {
    return "This check is currently marked as not relevant. Enable it under Advanced options if you wish to review it.";
  }
  if (/invalid verification status transition/i.test(errorMessage)) {
    return "This review status transition is not permitted from the current state. Start the check first.";
  }
  if (/controlled professional referral type is required/i.test(errorMessage)) {
    return "Please select who should conduct the professional review (e.g., Lawyer or Surveyor).";
  }
  if (/active admin actor required/i.test(errorMessage)) {
    return "Your admin session expired. Please refresh the page and try again.";
  }

  return errorMessage;
}
