import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { prepareQuestionnaireResultReadings, prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { completionGapEditorial } from "./CompletionGapEditorial";
import { EmotionDashboardPage } from "./EmotionDashboardPage";
import { WorkValuesPage } from "./WorkValuesPage";
import { FoodChoicePage } from "./FoodChoicePage";
import { CulturalDimensionsPage } from "./CulturalDimensionsPage";
import { DeepDesirePage } from "./DeepDesirePage";
import { PtqPage } from "./PtqPage";
import { SkillsAuditPage } from "./SkillsAuditPage";
import { CultureFitPage } from "./CultureFitPage";
import { WorkEthicsPage } from "./WorkEthicsPage";
import { NumberSeriesPage } from "./NumberSeriesPage";
import { SuperpowerPage } from "./SuperpowerPage";
import { MythicalCreaturePage } from "./MythicalCreaturePage";
import { DogBreedPage } from "./DogBreedPage";
import { SpiritAnimalPage } from "./SpiritAnimalPage";
import { SocialBatteryPage } from "./SocialBatteryPage";
import { Pss4Page } from "./Pss4Page";
import { ConnectionMeaningPage } from "./ConnectionMeaningPage";
import { BodyFrameObservationsPage } from "./BodyFrameObservationsPage";
import { ConnectionIdealsPage } from "./ConnectionIdealsPage";
import { ActivityEngagementPage } from "./ActivityEngagementPage";
import { StyleImpressionPage } from "./StyleImpressionPage";
import { OutfitLinePreferencesPage } from "./OutfitLinePreferencesPage";
import { attractionLandingSections, attractionLandingFaq, attractionLandingReferences } from "./AttractionLandingEditorial";
import { sd4LandingSections, sd4LandingFaq, sd4LandingReferences } from "./Sd4LandingEditorial";
import { workTraitsLandingSections, workTraitsLandingFaq } from "./WorkTraitsLandingEditorial";
import { relationshipWorryLandingSections, relationshipWorryLandingFaq, relationshipWorryLandingReferences } from "./RelationshipWorryLandingEditorial";
import { faceSelfImageLandingSections, faceSelfImageLandingFaq, faceSelfImageLandingReferences } from "./FaceSelfImageLandingEditorial";
import { workRoleLandingSections, workRoleLandingFaq } from "./WorkRoleLandingEditorial";
import { datingOutlookLandingSections, datingOutlookLandingFaq, datingOutlookLandingReferences } from "./DatingOutlookLandingEditorial";
import { relationshipHabitsLandingSections, relationshipHabitsLandingFaq, relationshipHabitsLandingReferences } from "./RelationshipHabitsLandingEditorial";
import { intimacyValuesLandingSections, intimacyValuesLandingFaq, intimacyValuesLandingReferences } from "./IntimacyValuesLandingEditorial";
import { workActivityLandingSections, workActivityLandingFaq, workActivityLandingReferences } from "./WorkActivityLandingEditorial";
import { tipi10LandingSections, tipi10LandingFaq, tipi10LandingReferences } from "./Tipi10LandingEditorial";
import { socialAttitudesLandingSections, socialAttitudesLandingFaq, socialAttitudesLandingReferences } from "./SocialAttitudesLandingEditorial";
import { interpersonalLandingSections, interpersonalLandingFaq } from "./InterpersonalLandingEditorial";
import { controlLandingSections, controlLandingFaq, controlLandingReferences } from "./EverydayControlLandingEditorial";
import { edgerunnersLandingSections, edgerunnersLandingFaq } from "./EdgerunnersLandingEditorial";
import { loveCombinationsLandingSections, loveCombinationsLandingFaq, loveCombinationsLandingReferences } from "./LoveCombinationsLandingEditorial";
import { foodDisgustLandingSections, foodDisgustLandingFaq } from "./FoodDisgustLandingEditorial";
import { energyRhythmLandingSections, energyRhythmLandingFaq, energyRhythmLandingReferences } from "./EnergyRhythmLandingEditorial";
import { playfulAgeLandingSections, playfulAgeLandingFaq, playfulAgeLandingReferences } from "./PlayfulAgeLandingEditorial";
import { everydayMixupsLandingSections, everydayMixupsLandingFaq, everydayMixupsLandingReferences } from "./EverydayMixupsLandingEditorial";
import { techConfidenceLandingSections, techConfidenceLandingFaq, techConfidenceLandingReferences } from "./TechConfidenceLandingEditorial";
import { orientationLandingSections, orientationLandingFaq, orientationLandingReferences } from "./OrientationLandingEditorial";
import { sakeTypeLandingSections, sakeTypeLandingFaq, sakeTypeLandingReferences } from "./SakeTypeLandingEditorial";
import { monthlyStressLandingSections, monthlyStressLandingFaq, monthlyStressLandingReferences, monthlyStressLandingDescription, monthlyStressLandingIntroduction } from "./MonthlyStressLandingEditorial";
import { conflictBoundaryLandingSections, conflictBoundaryLandingFaq, conflictBoundaryLandingReferences } from "./ConflictBoundaryLandingEditorial";
import { fourAxesLandingSections, fourAxesLandingFaq, fourAxesLandingReferences, fourAxesLandingDescription, fourAxesLandingIntroduction } from "./FourAxesLandingEditorial";
import { virtuesLandingSections, virtuesLandingFaq, virtuesLandingReferences } from "./VirtuesLandingEditorial";
import { euphoriaLandingSections, euphoriaLandingFaq } from "./EuphoriaLandingEditorial";
import { stressResponseLandingSections, stressResponseLandingFaq, stressResponseLandingReferences } from "./StressResponseLandingEditorial";
import { remoteWorkLandingSections, remoteWorkLandingFaq, remoteWorkLandingReferences } from "./RemoteWorkLandingEditorial";
import { freelanceReadyLandingSections, freelanceReadyLandingFaq, freelanceReadyLandingReferences } from "./FreelanceReadyLandingEditorial";
import { copingRhythmLandingSections, copingRhythmLandingFaq, copingRhythmLandingReferences } from "./CopingRhythmLandingEditorial";
import { habitPatternsLandingSections, habitPatternsLandingFaq, habitPatternsLandingReferences } from "./HabitPatternsLandingEditorial";
import { intimacyLandingSections, intimacyLandingFaq, intimacyLandingReferences } from "./IntimacyLandingEditorial";
import { breakupLandingSections, breakupLandingFaq, breakupLandingReferences } from "./BreakupLandingEditorial";
import { holdingLandingSections, holdingLandingFaq, holdingLandingReferences } from "./HoldingLandingEditorial";
import { fscrsLandingSections, fscrsLandingFaq, fscrsLandingReferences } from "./FscrsLandingEditorial";
import { parentingLandingSections, parentingLandingFaq, parentingLandingReferences } from "./ParentingLandingEditorial";
import { spqLandingSections, spqLandingFaq, spqLandingReferences } from "./SpqLandingEditorial";
import { competencyLandingSections, competencyLandingFaq, competencyLandingReferences } from "./CompetencyLandingEditorial";
import { hspLandingSections, hspLandingFaq, hspLandingReferences } from "./HspLandingEditorial";
import { adexiLandingSections, adexiLandingFaq, adexiLandingReferences } from "./AdexiLandingEditorial";
import { ctlLandingSections, ctlLandingFaq, ctlLandingReferences } from "./CtlLandingEditorial";
import { lovefightLandingSections, lovefightLandingFaq, lovefightLandingReferences } from "./LoveFightLandingEditorial";
import { annoyingLandingSections, annoyingLandingFaq, annoyingLandingReferences } from "./AnnoyingLandingEditorial";
import { sternbergLandingSections, sternbergLandingFaq, sternbergLandingReferences } from "./SternbergLandingEditorial";
import { jealousyLandingSections, jealousyLandingFaq, jealousyLandingReferences } from "./JealousyLandingEditorial";
import { moteLandingSections, moteLandingFaq, moteLandingReferences } from "./MoteLandingEditorial";
import { apologyLandingSections, apologyLandingFaq, apologyLandingReferences } from "./ApologyLandingEditorial";
import { sapsLandingSections, sapsLandingFaq, sapsLandingReferences } from "./SapsLandingEditorial";
import { friendshipFitLandingSections, friendshipFitLandingFaq, friendshipFitLandingReferences } from "./FriendshipFitLandingEditorial";
import { positivePressureLandingSections, positivePressureLandingFaq, positivePressureLandingReferences } from "./PositivePressureLandingEditorial";
import { conflictStylesLandingSections, conflictStylesLandingFaq, conflictStylesLandingReferences } from "./ConflictStylesLandingEditorial";
import { communicationAdaptabilityLandingSections, communicationAdaptabilityLandingFaq, communicationAdaptabilityLandingReferences } from "./CommunicationAdaptabilityLandingEditorial";
import { scs26LandingSections, scs26LandingFaq, scs26LandingReferences } from "./Scs26LandingEditorial";
import { wholesomePartnerLandingSections, wholesomePartnerLandingFaq, wholesomePartnerLandingReferences } from "./WholesomePartnerLandingEditorial";
import { cbiLandingSections, cbiLandingFaq, cbiLandingReferences } from "./CbiLandingEditorial";
import { timeManagementLandingSections, timeManagementLandingFaq, timeManagementLandingReferences } from "./TimeManagementLandingEditorial";
import { selfEsteemLandingSections, selfEsteemLandingFaq, selfEsteemLandingReferences } from "./SelfEsteemLandingEditorial";
import { mfq2LandingSections, mfq2LandingFaq, mfq2LandingReferences } from "./Mfq2LandingEditorial";
import { trustLandingSections, trustLandingFaq, trustLandingReferences } from "./TrustLandingEditorial";
import { libertyLandingSections, libertyLandingFaq, libertyLandingReferences } from "./LibertyLandingEditorial";
import { spatialReasoningLandingSections, spatialReasoningLandingFaq, spatialReasoningLandingReferences } from "./SpatialReasoningLandingEditorial";
import { mechanicalReasoningLandingSections, mechanicalReasoningLandingFaq } from "./MechanicalReasoningLandingEditorial";
import { politicalCoordinatesLandingSections, politicalCoordinatesLandingFaq, politicalCoordinatesLandingReferences } from "./PoliticalCoordinatesLandingEditorial";
import { commitmentLandingSections, commitmentLandingFaq, commitmentLandingReferences } from "./CommitmentLandingEditorial";
import { freudianLandingSections, freudianLandingFaq, freudianLandingReferences } from "./FreudianLandingEditorial";
import { adultAgePreferencesLandingSections, adultAgePreferencesLandingFaq, adultAgePreferencesLandingReferences } from "./AdultAgePreferencesLandingEditorial";
import { digitalCitizenshipLandingSections, digitalCitizenshipLandingFaq, digitalCitizenshipLandingReferences } from "./DigitalCitizenshipLandingEditorial";
import { numericalReasoningLandingSections, numericalReasoningLandingFaq, numericalReasoningLandingReferences } from "./NumericalReasoningLandingEditorial";
import { conservatismLandingSections, conservatismLandingFaq } from "./ConservatismLandingEditorial";
import { abstractReasoningLandingSections, abstractReasoningLandingFaq, abstractReasoningLandingReferences } from "./AbstractReasoningLandingEditorial";
import { relationshipPreferencesLandingSections, relationshipPreferencesLandingFaq, relationshipPreferencesLandingReferences } from "./RelationshipPreferencesLandingEditorial";
import { hexacoLandingSections, hexacoLandingFaq, hexacoLandingReferences } from "./HexacoLandingEditorial";
import { relationshipValuesLandingSections, relationshipValuesLandingFaq, relationshipValuesLandingReferences } from "./RelationshipValuesLandingEditorial";
import { eightValuesLandingSections, eightValuesLandingFaq, eightValuesLandingReferences } from "./EightValuesLandingEditorial";
import { situationalJudgementLandingSections, situationalJudgementLandingFaq, situationalJudgementLandingReferences } from "./SituationalJudgementLandingEditorial";
import { lovePersonalityLandingSections, lovePersonalityLandingFaq, lovePersonalityLandingReferences } from "./LovePersonalityLandingEditorial";
import { zodiacStoryLandingSections, zodiacStoryLandingFaq } from "./ZodiacStoryLandingEditorial";
import { germanLandingSections, germanLandingFaq, germanLandingReferences } from "./GermanLandingEditorial";
import { customerServiceLandingSections, customerServiceLandingFaq, customerServiceLandingReferences } from "./CustomerServiceLandingEditorial";
import { chineseZodiacLandingSections, chineseZodiacLandingFaq } from "./ChineseZodiacLandingEditorial";
import { aiLiteracyLandingSections, aiLiteracyLandingFaq, aiLiteracyLandingReferences } from "./AiLiteracyLandingEditorial";
import { personalFinanceLandingSections, personalFinanceLandingFaq, personalFinanceLandingReferences } from "./PersonalFinanceLandingEditorial";
import { rizzLandingSections, rizzLandingFaq, rizzLandingReferences } from "./RizzLandingEditorial";
import { projectManagementLandingSections, projectManagementLandingFaq } from "./ProjectManagementLandingEditorial";
import { wordSkillsLandingSections, wordSkillsLandingFaq } from "./WordSkillsLandingEditorial";
import { problemSolvingLandingSections, problemSolvingLandingFaq, problemSolvingLandingReferences } from "./ProblemSolvingLandingEditorial";
import { sqlLandingSections, sqlLandingFaq } from "./SqlLandingEditorial";
import { colorSeasonLandingSections, colorSeasonLandingFaq, colorSeasonLandingReferences } from "./ColorSeasonLandingEditorial";
import { salesAptitudeLandingSections, salesAptitudeLandingFaq } from "./SalesAptitudeLandingEditorial";
import { pythonLandingSections, pythonLandingFaq } from "./PythonLandingEditorial";
import { javaScriptLandingSections, javaScriptLandingFaq } from "./JavaScriptLandingEditorial";
import { logicalReasoningLandingSections, logicalReasoningLandingFaq } from "./LogicalReasoningLandingEditorial";
import { erasOfYouLandingSections, erasOfYouLandingFaq, erasOfYouLandingReferences } from "./ErasOfYouLandingEditorial";
import { financialAccountingLandingSections, financialAccountingLandingFaq } from "./FinancialAccountingLandingEditorial";
import { javaLandingSections, javaLandingFaq } from "./JavaLandingEditorial";
import { foundFamilyRoleLandingSections, foundFamilyRoleLandingFaq } from "./FoundFamilyRoleLandingEditorial";
import { excelSkillsLandingSections, excelSkillsLandingFaq } from "./ExcelSkillsLandingEditorial";
import { feminineEnergyLandingSections, feminineEnergyLandingFaq } from "./FeminineEnergyLandingEditorial";
import { computerLiteracyLandingSections, computerLiteracyLandingFaq } from "./ComputerLiteracyLandingEditorial";
import { verbalReasoningLandingSections, verbalReasoningLandingFaq } from "./VerbalReasoningLandingEditorial";
import { bigFishLandingSections, bigFishLandingFaq } from "./BigFishLandingEditorial";
import { barbieLandingSections, barbieLandingFaq } from "./BarbieLandingEditorial";
import { apocalypseLandingSections, apocalypseLandingFaq } from "./ApocalypseLandingEditorial";
import { spanishProficiencyLandingSections, spanishProficiencyLandingFaq } from "./SpanishProficiencyLandingEditorial";
import { spaceMarineChaptersLandingSections, spaceMarineChaptersLandingFaq } from "./SpaceMarineChaptersLandingEditorial";
import { storybookFriendsLandingSections, storybookFriendsLandingFaq } from "./StorybookFriendsLandingEditorial";
import { grammarLandingSections, grammarLandingFaq } from "./GrammarLandingEditorial";
import { animeStoryRolesLandingSections, animeStoryRolesLandingFaq } from "./AnimeStoryRolesLandingEditorial";
import { blueLockLandingSections, blueLockLandingFaq } from "./BlueLockLandingEditorial";
import { villainEraLandingSections, villainEraLandingFaq } from "./VillainEraLandingEditorial";
import { englishProficiencyLandingSections, englishProficiencyLandingFaq } from "./EnglishProficiencyLandingEditorial";
import { gossipGirlLandingSections, gossipGirlLandingFaq } from "./GossipGirlLandingEditorial";
import { digitalCircusLandingSections, digitalCircusLandingFaq } from "./DigitalCircusLandingEditorial";
import { gameOfThronesLandingSections, gameOfThronesLandingFaq } from "./GameOfThronesLandingEditorial";
import { decadeLandingSections, decadeLandingFaq } from "./DecadeLandingEditorial";
import { twilightLandingSections, twilightLandingFaq } from "./TwilightLandingEditorial";
import { wednesdayLandingSections, wednesdayLandingFaq } from "./WednesdayLandingEditorial";
import { strangerThingsLandingSections, strangerThingsLandingFaq } from "./StrangerThingsLandingEditorial";
import { avengersLandingSections, avengersLandingFaq } from "./AvengersLandingEditorial";
import { dexterLandingSections, dexterLandingFaq } from "./DexterLandingEditorial";
import { spellingLandingSections, spellingLandingFaq } from "./SpellingLandingEditorial";
import { harryPotterLandingSections, harryPotterLandingFaq } from "./HarryPotterLandingEditorial";
import { egenTetoLandingSections, egenTetoLandingFaq } from "./EgenTetoLandingEditorial";
import { jujutsuKaisenLandingSections, jujutsuKaisenLandingFaq } from "./JujutsuKaisenLandingEditorial";
import { aptitudeLandingSections, aptitudeLandingFaq } from "./AptitudeLandingEditorial";
import { gilmoreGirlsLandingSections, gilmoreGirlsLandingFaq } from "./GilmoreGirlsLandingEditorial";
import { southParkLandingSections, southParkLandingFaq } from "./SouthParkLandingEditorial";
import { workplaceTechnologyLandingSections, workplaceTechnologyLandingFaq } from "./WorkplaceTechnologyLandingEditorial";
import { nanaLandingSections, nanaLandingFaq } from "./NanaLandingEditorial";
import { deluluLandingSections, deluluLandingFaq } from "./DeluluLandingEditorial";
import { cybersecurityLandingSections, cybersecurityLandingFaq } from "./CybersecurityLandingEditorial";
import { wojakLandingSections, wojakLandingFaq } from "./WojakLandingEditorial";
import { attentionDetailLandingSections, attentionDetailLandingFaq } from "./AttentionDetailLandingEditorial";
import { myLittlePonyLandingSections, myLittlePonyLandingFaq } from "./MyLittlePonyLandingEditorial";
import { myHeroAcademiaLandingSections, myHeroAcademiaLandingFaq } from "./MyHeroAcademiaLandingEditorial";
import { hazbinHotelLandingSections, hazbinHotelLandingFaq } from "./HazbinHotelLandingEditorial";
import { ginnyGeorgiaLandingSections, ginnyGeorgiaLandingFaq } from "./GinnyGeorgiaLandingEditorial";
import { nextLifeLandingSections, nextLifeLandingFaq } from "./NextLifeLandingEditorial";
import { darkTriadLandingSections, darkTriadLandingFaq } from "./DarkTriadLandingEditorial";
import { moralDilemmaLandingSections, moralDilemmaLandingFaq } from "./MoralDilemmaLandingEditorial";
import { egogramLandingSections, egogramLandingFaq } from "./EgogramLandingEditorial";
import { socialIntelligenceLandingSections, socialIntelligenceLandingFaq } from "./SocialIntelligenceLandingEditorial";
import { maleRoleLandingSections, maleRoleLandingFaq } from "./MaleRoleLandingEditorial";
import { ikigaiLandingSections, ikigaiLandingFaq } from "./IkigaiLandingEditorial";
import { gritLandingSections, gritLandingFaq } from "./GritLandingEditorial";
import { habitsLandingSections, habitsLandingFaq } from "./HabitsLandingEditorial";
import { thinkingApproachLandingSections, thinkingApproachLandingFaq } from "./ThinkingApproachLandingEditorial";
import { locusLandingSections, locusLandingFaq } from "./LocusLandingEditorial";
import { growthLandingSections, growthLandingFaq } from "./GrowthLandingEditorial";
import { maturityLandingSections, maturityLandingFaq } from "./MaturityLandingEditorial";
import { compassLandingSections, compassLandingFaq } from "./CompassLandingEditorial";
import { inkblotLandingSections, inkblotLandingFaq } from "./InkblotLandingEditorial";
import { philosopherLandingSections, philosopherLandingFaq } from "./PhilosopherLandingEditorial";
import { helloKittyLandingSummary } from "./HelloKittyLandingEditorial";
import { starWarsLandingSummary } from "./StarWarsLandingEditorial";
import { bleachLandingSummary } from "./BleachLandingEditorial";
import { deathNoteLandingSummary } from "./DeathNoteLandingEditorial";
import { narutoLandingSummary } from "./NarutoLandingEditorial";
import { disneyPrincessLandingSummary } from "./DisneyPrincessLandingEditorial";
import { chiikawaLandingSummary } from "./ChiikawaLandingEditorial";
import { bojackLandingSummary } from "./BoJackLandingEditorial";
import { moonPhaseLandingSummary } from "./MoonPhaseLandingEditorial";
import { greekLandingSummary } from "./GreekLandingEditorial";
import { hogwartsLandingSummary } from "./HogwartsLandingEditorial";
import { dereLandingSummary } from "./DereLandingEditorial";
import { strengthsLandingSummary } from "./StrengthsLandingEditorial";
import { learningLandingSummary } from "./LearningLandingEditorial";
import { procrastinationLandingSummary } from "./ProcrastinationLandingEditorial";
import { likableLandingSummary } from "./LikableLandingEditorial";
import { frictionLandingSummary } from "./FrictionLandingEditorial";
import { peoplePleaserLandingSummary } from "./PeoplePleaserLandingEditorial";
import { musicLandingSummary } from "./MusicLandingEditorial";
import { aestheticLandingSummary } from "./AestheticLandingEditorial";
import { travelLandingSummary } from "./TravelLandingEditorial";
import { humorLandingSummary } from "./HumorLandingEditorial";
import { leadershipLandingSummary } from "./LeadershipLandingEditorial";
import { communicationLandingSummary } from "./CommunicationLandingEditorial";
import { attachmentLandingSummary } from "./AttachmentLandingEditorial";
import { loveLanguagesLandingSummary } from "./LoveLanguagesLandingEditorial";
import { temperamentLandingSummary } from "./TemperamentLandingEditorial";
import { introvertExtrovertLandingSummary } from "./IntrovertExtrovertLandingEditorial";
import { jungianArchetypeLandingSummary } from "./JungianArchetypeLandingEditorial";
import { moralAlignmentLandingSummary } from "./MoralAlignmentLandingEditorial";
import { responseColorLandingSummary } from "./ResponseColorLandingEditorial";
import { DiscCitations, discLandingSummary } from "./DiscLandingEditorial";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import { isPss4ConfigurationValid } from "@/lib/questionnaires/pss4";
import { isUnfamiliar20ConfigurationValid } from "@/lib/questionnaires/unfamiliar20";
import { UnfamiliarPage } from "./UnfamiliarPage";
import { isUncertaintyEase6ConfigurationValid } from "@/lib/questionnaires/uncertaintyEase6";
import { UncertaintyEasePage } from "./UncertaintyEasePage";
import { isDisconnection20ConfigurationValid } from "@/lib/questionnaires/disconnection20";
import { DisconnectionPage } from "./DisconnectionPage";
import { isFeedbackWorth12ConfigurationValid } from "@/lib/questionnaires/feedbackWorth12";
import { FeedbackWorthPage } from "./FeedbackWorthPage";
import { isSpatialContext4ConfigurationValid } from "@/lib/questionnaires/spatialContext4";
import { SpatialContextPage } from "./SpatialContextPage";
import { isEmotionsConnections21ConfigurationValid } from "@/lib/questionnaires/emotionsConnections21";
import { EmotionsConnectionsPage } from "./EmotionsConnectionsPage";
import { isFeelingsConnection8ConfigurationValid } from "@/lib/questionnaires/feelingsConnection8";
import { FeelingsConnectionPage } from "./FeelingsConnectionPage";
import { isGenderExperiences16ConfigurationValid } from "@/lib/questionnaires/genderExperiences16";
import { GenderExperiencesPage } from "./GenderExperiencesPage";
import { isCommunicationRoutines20ConfigurationValid } from "@/lib/questionnaires/communicationRoutines20";
import { CommunicationRoutinesPage } from "./CommunicationRoutinesPage";
import { isEatingExperiences20ConfigurationValid } from "@/lib/questionnaires/eatingExperiences20";
import { EatingExperiencesPage } from "./EatingExperiencesPage";
import { isCaregiverContext20ConfigurationValid } from "@/lib/questionnaires/caregiverContext20";
import { CaregiverContextPage } from "./CaregiverContextPage";
import { isCareFeelings20ConfigurationValid } from "@/lib/questionnaires/careFeelings20";
import { CareFeelingsPage } from "./CareFeelingsPage";
import { isNakshatra27ConfigurationValid } from "@/lib/questionnaires/nakshatra27";
import { Nakshatra27Page } from "./Nakshatra27Page";
import { WetonStory35Page } from "./WetonStory35Page";
import { isWetonStory35ConfigurationValid } from "@/lib/questionnaires/wetonStory35";
import { Bpi21Page } from "./Bpi21Page";
import { isBpi21ConfigurationValid } from "@/lib/questionnaires/bpi21";
import { ConnectionMeaningClient } from "./ConnectionMeaningClient";
import { BodyFrameObservationsClient } from "./BodyFrameObservationsClient";
import { ConnectionIdealsClient } from "./ConnectionIdealsClient";
import { isSuddenFear20ConfigurationValid } from "@/lib/questionnaires/suddenFear20";
import { SuddenFearPage } from "./SuddenFearPage";
import { isUnwantedActions20ConfigurationValid } from "@/lib/questionnaires/unwantedActions20";
import { UnwantedActionsPage } from "./UnwantedActionsPage";
import { isFocusContext16ConfigurationValid } from "@/lib/questionnaires/focusContext16";
import { FocusContextPage } from "./FocusContextPage";
import { isWrittenLanguage20ConfigurationValid } from "@/lib/questionnaires/writtenLanguage20";
import { WrittenLanguagePage } from "./WrittenLanguagePage";
import { isNumberContext20ConfigurationValid } from "@/lib/questionnaires/numberContext20";
import { NumberContextPage } from "./NumberContextPage";
import { isSocialContext20ConfigurationValid } from "@/lib/questionnaires/socialContext20";
import { SocialContextPage } from "./SocialContextPage";
import { isEverydayWorry12ConfigurationValid } from "@/lib/questionnaires/everydayWorry12";
import { EverydayWorryPage } from "./EverydayWorryPage";
import { isRecentMood12ConfigurationValid } from "@/lib/questionnaires/recentMood12";
import { RecentMoodPage } from "./RecentMoodPage";
import { isMoodActivity16ConfigurationValid } from "@/lib/questionnaires/moodActivity16";
import { MoodActivityPage } from "./MoodActivityPage";
import { isCycleContext16ConfigurationValid } from "@/lib/questionnaires/cycleContext16";
import { CycleContextPage } from "./CycleContextPage";
import { isBirthContext16ConfigurationValid } from "@/lib/questionnaires/birthContext16";
import { BirthContextPage } from "./BirthContextPage";
import { isSeasonContext16ConfigurationValid } from "@/lib/questionnaires/seasonContext16";
import { SeasonContextPage } from "./SeasonContextPage";
import { isHealthWorry21ConfigurationValid } from "@/lib/questionnaires/healthWorry21";
import { HealthWorryPage } from "./HealthWorryPage";
import { isSleepExperiences20ConfigurationValid } from "@/lib/questionnaires/sleepExperiences20";
import { SleepExperiencesPage } from "./SleepExperiencesPage";
import { isBereavement16ConfigurationValid } from "@/lib/questionnaires/bereavement16";
import { BereavementPage } from "./BereavementPage";
import { isDrinkingExperiences20ConfigurationValid } from "@/lib/questionnaires/drinkingExperiences20";
import { DrinkingExperiencesPage } from "./DrinkingExperiencesPage";
import { isSupportReflection18ConfigurationValid } from "@/lib/questionnaires/supportReflection18";
import { SupportReflectionPage } from "./SupportReflectionPage";
import { isConnectionCheckIn21ConfigurationValid } from "@/lib/questionnaires/connectionCheckIn21";
import { ConnectionCheckInPage } from "./ConnectionCheckInPage";
import { isPressureActions12ConfigurationValid } from "@/lib/questionnaires/pressureActions12";
import { PressureActionsPage } from "./PressureActionsPage";
import { isTraumaResponse20ConfigurationValid } from "@/lib/questionnaires/traumaResponse20";
import { TraumaResponsePage } from "./TraumaResponsePage";
import { isDistributedWork24ConfigurationValid } from "@/lib/questionnaires/distributedWork24";
import { DistributedWorkPage } from "./DistributedWorkPage";
import { isWrittenCoordinationConfigurationValid } from "@/lib/questionnaires/writtenCoordination";
import { WrittenCoordinationPage } from "./WrittenCoordinationPage";
import { WorkTraitsContext } from "./WorkTraitsReport";
import { isWorkRole12ConfigurationValid } from "@/lib/questionnaires/workRole12";
import { WorkActivityContext } from "./WorkActivityInterestsReport";
import { isSbti31ConfigurationValid } from "@/lib/questionnaires/sbti31";
import { Sbti31Page } from "./Sbti31Page";
import { isCritical30ConfigurationValid } from "@/lib/questionnaires/critical30";
import { Critical30Page } from "./Critical30Page";
import { isReasoning18ConfigurationValid } from "@/lib/questionnaires/reasoning18";
import { Reasoning18Page } from "./Reasoning18Page";
import { isMattering10ConfigurationValid } from "@/lib/questionnaires/mattering10";
import { Mattering10Page } from "./Mattering10Page";
import { isTechnical30ConfigurationValid } from "@/lib/questionnaires/technical30";
import { Technical30Page } from "./Technical30Page";
import { CognitiveFunctionsPage, isCognitiveFunctionsPageAvailable } from "./CognitiveFunctionsPage";
import { isDvmsq18ConfigurationValid } from "@/lib/questionnaires/dvmsq18";
import { Dvmsq18Page } from "./Dvmsq18Page";
import { isSynes15ConfigurationValid } from "@/lib/questionnaires/synes15";
import { Synes15Page } from "./Synes15Page";
import { isAfqt32ConfigurationValid } from "@/lib/questionnaires/afqt32";
import { Afqt32Page } from "./Afqt32Page";
import { isAnger20ConfigurationValid } from "@/lib/questionnaires/anger20";
import { Anger20Page } from "./Anger20Page";
import { isSens16ConfigurationValid } from "@/lib/questionnaires/sens16";
import { Sens16Page } from "./Sens16Page";
import { isImagery12ConfigurationValid } from "@/lib/questionnaires/imagery12";
import { Imagery12Page } from "./Imagery12Page";
import { isImposter20ConfigurationValid } from "@/lib/questionnaires/imposter20";
import { Imposter20Page } from "./Imposter20Page";
import { isCatQ25ConfigurationValid } from "@/lib/questionnaires/catq25";
import { CatQ25Page } from "./CatQ25Page";
import { isMostLeastConfigurationValid } from "@/lib/questionnaires/mostLeast";
import { MostLeastPage } from "./MostLeastPage";
import { isCareerMatchConfigurationValid } from "@/lib/questionnaires/careerMatch";
import { CareerMatchPage } from "./CareerMatchPage";
import { isLoveType16ConfigurationValid } from "@/lib/questionnaires/loveType16";
import { isFds32ConfigurationValid } from "@/lib/questionnaires/fds32";
import { QuestionnaireFds32Attribution } from "./QuestionnaireFds32Attribution";
import { isMentalAgeConfigurationValid } from "@/lib/questionnaires/mentalAge";
import { isMiniOrientationConfigurationValid } from "@/lib/questionnaires/miniOrientation";
import { QuestionnaireOrientationClient } from "./QuestionnaireOrientationClient";
import { isStressReflection4ConfigurationValid } from "@/lib/questionnaires/stressReflection4";
import { QuestionnaireStressCheckInClient } from "./QuestionnaireStressCheckInClient";
import { isMiniConflictConfigurationValid } from "@/lib/questionnaires/miniConflict";
import { QuestionnaireConflictClient } from "./QuestionnaireConflictClient";
import { isFourAxesConfigurationValid } from "@/lib/questionnaires/fourAxes";
import { QuestionnaireFourAxesClient } from "./QuestionnaireFourAxesClient";
import { isMiniVirtuesConfigurationValid } from "@/lib/questionnaires/miniVirtues";
import { isEuphoriaConfigurationValid } from "@/lib/questionnaires/euphoria";
import { isMiniShadowConfigurationValid } from "@/lib/questionnaires/miniShadow";
import { QuestionnaireShadowClient } from "./QuestionnaireShadowClient";
import { isPreparationActions20ConfigurationValid } from "@/lib/questionnaires/preparationActions20";
import { isMiniCopingConfigurationValid } from "@/lib/questionnaires/miniCoping";
import { QuestionnaireCopingClient } from "./QuestionnaireCopingClient";
import { isMiniHabitConfigurationValid } from "@/lib/questionnaires/miniHabit";
import { QuestionnaireHabitClient } from "./QuestionnaireHabitClient";
import { isMiniIntimacyConfigurationValid } from "@/lib/questionnaires/miniIntimacy";
import { QuestionnaireIntimacyClient } from "./QuestionnaireIntimacyClient";
import { isNatalChartConfigurationValid } from "@/lib/questionnaires/natalChart";
import { NatalChartPage } from "./NatalChartPage";
import { isNineStarYearConfigurationValid } from "@/lib/questionnaires/nineStarYear";
import { NineStarYearPage } from "./NineStarYearPage";
import { isMiniBreakupConfigurationValid } from "@/lib/questionnaires/miniBreakup";
import { isHoldingBack35ConfigurationValid } from "@/lib/questionnaires/holdingBack35";
import { isFscrs22ConfigurationValid } from "@/lib/questionnaires/fscrs22";
import { QuestionnaireFscrs22Client } from "./QuestionnaireFscrs22Client";
import { QuestionnaireFscrs22Attribution } from "./QuestionnaireFscrs22Attribution";
import { isParentingPracticesConfigurationValid } from "@/lib/questionnaires/parentingPractices";
import { isSpq92ConfigurationValid } from "@/lib/questionnaires/spq92";
import { isAdexi14ConfigurationValid } from "@/lib/questionnaires/adexi14";
import { isMiniFrictionConfigurationValid } from "@/lib/questionnaires/miniFriction";
import { isCtl41ConfigurationValid } from "@/lib/questionnaires/ctl41";
import { QuestionnaireCtl41Attribution } from "./QuestionnaireCtl41Attribution";
import { isPtq15ConfigurationValid } from "@/lib/questionnaires/ptq15";
import { isInteractionPairsConfigurationValid } from "@/lib/questionnaires/interactionPairs";
import { isSkillsEvidenceConfigurationValid } from "@/lib/questionnaires/skillsEvidence";
import { isBirthNumberConfigurationValid } from "@/lib/questionnaires/birthNumber";
import { isTipi10ConfigurationValid } from "@/lib/questionnaires/tipi10";
import { isSd4ConfigurationValid } from "@/lib/questionnaires/sd4";
import { QuestionnaireSd4Attribution } from "./QuestionnaireSd4Attribution";
import { Tipi10Attribution } from "./Tipi10Attribution";
import { isSapsConfigurationValid } from "@/lib/questionnaires/saps";
import { QuestionnaireSapsAttribution } from "./QuestionnaireSapsAttribution";
import { isScs26ConfigurationValid } from "@/lib/questionnaires/scs26";
import { isCbiConfigurationValid } from "@/lib/questionnaires/cbi";
import { isRosenbergConfigurationValid } from "@/lib/questionnaires/rosenberg";
import { isPoliticalCoordinatesConfigurationValid } from "@/lib/questionnaires/politicalCoordinates";
import { isDataEntryConfigurationValid } from "@/lib/questionnaires/dataEntry";
import { DataEntryPage } from "./DataEntryPage";
import { isSecsConfigurationValid } from "@/lib/questionnaires/secs";
import { isPairedDimensionsConfigurationValid } from "@/lib/questionnaires/pairedDimensions";
import { isTypingConfigurationValid } from "@/lib/questionnaires/typing";
import { TypingPage } from "./TypingPage";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { QuestionnaireCharacterSource } from "./QuestionnaireCharacterSource";
import { QuestionnairePpsAttribution } from "./QuestionnairePpsAttribution";
import { QuestionnaireMfq2Attribution } from "./QuestionnaireMfq2Attribution";
import { QuestionnaireCbiAttribution } from "./QuestionnaireCbiAttribution";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { TenKeyPage } from "./TenKeyPage";
import { QuestionnaireDarkTriadClient } from "./QuestionnaireDarkTriadClient";
import { QuestionnaireSd4Client } from "./QuestionnaireSd4Client";
import { AttractionExperiencesClient } from "./AttractionExperiencesClient";
import { OutfitLinePreferencesClient } from "./OutfitLinePreferencesClient";
import { ActivityEngagementClient } from "./ActivityEngagementClient";
import { StyleImpressionClient } from "./StyleImpressionClient";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { isQuestionnaireConfigurationValid } from "@/lib/questionnaires/scoring";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";

import { BirthNumberPage } from "./BirthNumberPage";

type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: input, slug } = await params, locale = resolveLocale(input);
  const quiz = await loadQuestionnaire(slug);
  if (quiz?.kind === "sudden-fear20" && !isSuddenFear20ConfigurationValid(quiz)) return { title: "Sudden-fear reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "nakshatra27" && !isNakshatra27ConfigurationValid(quiz)) return { title: "Birth-star reference unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "unwanted-actions20" && !isUnwantedActions20ConfigurationValid(quiz)) return { title: "Thoughts-and-actions reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "caregiver-context20" && !isCaregiverContext20ConfigurationValid(quiz)) return { title: "Caregiver reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "communication-routines20" && !isCommunicationRoutines20ConfigurationValid(quiz)) return { title: "Context reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "feelings-connection8" && !isFeelingsConnection8ConfigurationValid(quiz)) return { title: "Feelings reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "spatial-context4" && !isSpatialContext4ConfigurationValid(quiz)) return { title: "Spatial reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "care-feelings20" && !isCareFeelings20ConfigurationValid(quiz)) return { title: "Care reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "disconnection20" && !isDisconnection20ConfigurationValid(quiz)) return { title: "Experience reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "unfamiliar20" && !isUnfamiliar20ConfigurationValid(quiz)) return { title: "Experience reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "focus-context16" && !isFocusContext16ConfigurationValid(quiz)) return { title: "Daily-context reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "written-language20" && !isWrittenLanguage20ConfigurationValid(quiz)) return { title: "Written-language reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "number-context20" && !isNumberContext20ConfigurationValid(quiz)) return { title: "Written-language reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "social-context20" && !isSocialContext20ConfigurationValid(quiz)) return { title: "Social-context reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "worry-observations12" && !isEverydayWorry12ConfigurationValid(quiz)) return { title: "Everyday-worry reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "mood-observations12" && !isRecentMood12ConfigurationValid(quiz)) return { title: "Recent-mood reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "mood-activity16" && !isMoodActivity16ConfigurationValid(quiz)) return { title: "Mood-activity reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "cycle-context16" && !isCycleContext16ConfigurationValid(quiz)) return { title: "Cycle-context reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "birth-context16" && !isBirthContext16ConfigurationValid(quiz)) return { title: "Birth-context reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "season-context16" && !isSeasonContext16ConfigurationValid(quiz)) return { title: "Season-context reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "health-worries21" && !isHealthWorry21ConfigurationValid(quiz)) return { title: "Health-worry reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "sleep-experiences20" && !isSleepExperiences20ConfigurationValid(quiz)) return { title: "Sleep reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "bereavement16" && !isBereavement16ConfigurationValid(quiz)) return { title: "Bereavement reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "weton-story35" && !isWetonStory35ConfigurationValid(quiz)) return { title: "Weton story unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "bpi21" && !isBpi21ConfigurationValid(quiz)) return { title: "BPI-21 unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "eating-experiences20" && !isEatingExperiences20ConfigurationValid(quiz)) return { title: "Eating reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "gender-experiences16" && !isGenderExperiences16ConfigurationValid(quiz)) return { title: "Gender reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "emotions-connections21" && !isEmotionsConnections21ConfigurationValid(quiz)) return { title: "Emotions reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "feedback-worth12" && !isFeedbackWorth12ConfigurationValid(quiz)) return { title: "Feedback reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "uncertainty-ease6" && !isUncertaintyEase6ConfigurationValid(quiz)) return { title: "Uncertainty reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "drinking-experiences20" && !isDrinkingExperiences20ConfigurationValid(quiz)) return { title: "Drinking reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "support-reflection18" && !isSupportReflection18ConfigurationValid(quiz)) return { title: "Support reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "connection-checkin21" && !isConnectionCheckIn21ConfigurationValid(quiz)) return { title: "Connection reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "pressure-actions12" && !isPressureActions12ConfigurationValid(quiz)) return { title: "Action reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "trauma-response20" && !isTraumaResponse20ConfigurationValid(quiz)) return { title: "Observation reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "distributed-work24" && !isDistributedWork24ConfigurationValid(quiz)) return { title: "Coordination reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "written-coordination" && !isWrittenCoordinationConfigurationValid(quiz)) return { title: "Written practice unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "sbti31" && !isSbti31ConfigurationValid(quiz)) return { title: "SBTI edition unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "mattering10" && !isMattering10ConfigurationValid(quiz)) return { title: "Mattering unavailable", robots: { index: false, follow: false } };
  if (quiz?.slug === "cognitive-functions-test" && !isCognitiveFunctionsPageAvailable(quiz)) return { title: "Edition unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "dvmsq18" && !isDvmsq18ConfigurationValid(quiz)) return { title: "DVMSQ unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "synes15" && !isSynes15ConfigurationValid(quiz)) return { title: "Experience checklist unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "reasoning18" && !isReasoning18ConfigurationValid(quiz)) return { title: "Practice unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "critical30" && !isCritical30ConfigurationValid(quiz)) return { title: "Practice unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "technical30" && !isTechnical30ConfigurationValid(quiz)) return { title: "Practice unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "afqt32" && !isAfqt32ConfigurationValid(quiz)) return { title: "Practice unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "anger20" && !isAnger20ConfigurationValid(quiz)) return { title: "Anger reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "sens16" && !isSens16ConfigurationValid(quiz)) return { title: "Sensory reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "imagery12" && !isImagery12ConfigurationValid(quiz)) return { title: "Imagery reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "imposter20" && !isImposter20ConfigurationValid(quiz)) return { title: "Reflection unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "catq25" && !isCatQ25ConfigurationValid(quiz)) return { title: "CAT-Q unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "most-least" && !isMostLeastConfigurationValid(quiz)) return { title: "Practice unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "career-theme-compare" && !isCareerMatchConfigurationValid(quiz)) return { title: "Comparison unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "love-type16" && !isLoveType16ConfigurationValid(quiz)) return { title: "Guide unavailable", robots: { index: false, follow: false } };
  if (((quiz?.kind === "mini-virtues" || quiz?.slug === "seven-sins-virtues-test") && !isMiniVirtuesConfigurationValid(quiz)) || (quiz?.slug === "euphoria-character-quiz" && !isEuphoriaConfigurationValid(quiz))) return { title: "Guide unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "natal-chart" && !isNatalChartConfigurationValid(quiz)) return { title: "Chart unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "nine-star-year" && !isNineStarYearConfigurationValid(quiz)) return { title: "Year reference unavailable", robots: { index: false, follow: false } };
  if (quiz?.kind === "birth-number" && !isBirthNumberConfigurationValid(quiz)) return { title: "Calculator unavailable", robots: { index: false, follow: false } };
  if (!quiz || (quiz.kind === "fds32" && !isFds32ConfigurationValid(quiz)) || (quiz.kind === "mental-age" && !isMentalAgeConfigurationValid(quiz)) || (quiz.kind === "pss4" && !isPss4ConfigurationValid(quiz)) || (quiz.kind === "stress-reflection4" && !isStressReflection4ConfigurationValid(quiz)) || (quiz.kind === "mini-orientation" && !isMiniOrientationConfigurationValid(quiz)) || (quiz.kind === "mini-conflict" && !isMiniConflictConfigurationValid(quiz)) || (quiz.kind === "four-axes" && !isFourAxesConfigurationValid(quiz)) || (quiz.kind === "mini-shadow" && !isMiniShadowConfigurationValid(quiz)) || (quiz.kind === "preparation-actions20" && !isPreparationActions20ConfigurationValid(quiz)) || (quiz.kind === "mini-coping" && !isMiniCopingConfigurationValid(quiz)) || (quiz.kind === "mini-habit" && !isMiniHabitConfigurationValid(quiz)) || (quiz.kind === "mini-intimacy" && !isMiniIntimacyConfigurationValid(quiz)) || (quiz.kind === "mini-breakup" && !isMiniBreakupConfigurationValid(quiz)) || (quiz.kind === "holding-back35" && !isHoldingBack35ConfigurationValid(quiz)) || (quiz.kind === "fscrs22" && !isFscrs22ConfigurationValid(quiz)) || (quiz.kind === "parenting-practices" && !isParentingPracticesConfigurationValid(quiz)) || (quiz.kind === "spq92" && !isSpq92ConfigurationValid(quiz)) || (quiz.kind === "adexi14" && !isAdexi14ConfigurationValid(quiz)) || (quiz.kind === "mini-friction" && !isMiniFrictionConfigurationValid(quiz)) || (quiz.kind === "ctl41" && !isCtl41ConfigurationValid(quiz)) || (quiz.kind === "ptq15" && !isPtq15ConfigurationValid(quiz)) || (quiz.kind === "interaction-pairs" && !isInteractionPairsConfigurationValid(quiz)) || (quiz.kind === "work-role12" && !isWorkRole12ConfigurationValid(quiz)) || (quiz.kind === "skills-evidence" && !isSkillsEvidenceConfigurationValid(quiz)) || (quiz.slug === "dark-tetrad-sd4" && !isSd4ConfigurationValid(quiz)) || (quiz.kind === "tipi10" && !isTipi10ConfigurationValid(quiz)) || (quiz.kind === "saps" && !isSapsConfigurationValid(quiz)) || (quiz.kind === "scs26" && !isScs26ConfigurationValid(quiz)) || (quiz.kind === "cbi" && !isCbiConfigurationValid(quiz)) || (quiz.kind === "rosenberg" && !isRosenbergConfigurationValid(quiz)) || (quiz.kind === "political-coordinates" && !isPoliticalCoordinatesConfigurationValid(quiz)) || (quiz.kind === "data-entry" && !isDataEntryConfigurationValid(quiz)) || (quiz.kind === "secs" && !isSecsConfigurationValid(quiz)) || (quiz.kind === "paired-dimensions" && !isPairedDimensionsConfigurationValid(quiz)) || (quiz.kind === "typing" && !isTypingConfigurationValid(quiz))) return { title: "Test unavailable", robots: { index: false, follow: false } };
  return buildPageMetadata({ locale, pathname: questionnairePath(locale, slug), title: quiz.seoTitle[locale], description: (slug === "stress-check-in-test" ? monthlyStressLandingDescription[locale] : slug === "four-axes-test" ? fourAxesLandingDescription[locale] : quiz.description[locale]), imagePath: `/og/fun/${slug}?locale=${locale}&v=${quiz.version}`, alternatesByLocale: { en: questionnairePath("en", slug), zh: questionnairePath("zh", slug), xDefault: questionnairePath("en", slug) } });
}

export default async function QuestionnairePage({ params, take = false }: Props & { take?: boolean }) {
  const { locale: input, slug } = await params, locale = resolveLocale(input), zh = locale === "zh";
  const quiz = await loadQuestionnaire(slug);
  if (quiz?.kind === "sudden-fear20") {
    if (!isSuddenFear20ConfigurationValid(quiz)) notFound();
    return <SuddenFearPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "nakshatra27") {
    if (!isNakshatra27ConfigurationValid(quiz)) notFound();
    return <Nakshatra27Page quiz={quiz} locale={locale} />;
  }
  if (quiz?.kind === "unwanted-actions20") {
    if (!isUnwantedActions20ConfigurationValid(quiz)) notFound();
    return <UnwantedActionsPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "caregiver-context20") {
    if (!isCaregiverContext20ConfigurationValid(quiz)) notFound();
    return <CaregiverContextPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "communication-routines20") {
    if (!isCommunicationRoutines20ConfigurationValid(quiz)) notFound();
    return <CommunicationRoutinesPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "feelings-connection8") {
    if (!isFeelingsConnection8ConfigurationValid(quiz)) notFound();
    return <FeelingsConnectionPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "spatial-context4") {
    if (!isSpatialContext4ConfigurationValid(quiz)) notFound();
    return <SpatialContextPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "care-feelings20") {
    if (!isCareFeelings20ConfigurationValid(quiz)) notFound();
    return <CareFeelingsPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "disconnection20") {
    if (!isDisconnection20ConfigurationValid(quiz)) notFound();
    return <DisconnectionPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "unfamiliar20") {
    if (!isUnfamiliar20ConfigurationValid(quiz)) notFound();
    return <UnfamiliarPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "focus-context16") {
    if (!isFocusContext16ConfigurationValid(quiz)) notFound();
    return <FocusContextPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "written-language20") {
    if (!isWrittenLanguage20ConfigurationValid(quiz)) notFound();
    return <WrittenLanguagePage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "number-context20") {
    if (!isNumberContext20ConfigurationValid(quiz)) notFound();
    return <NumberContextPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "social-context20") {
    if (!isSocialContext20ConfigurationValid(quiz)) notFound();
    return <SocialContextPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "worry-observations12") {
    if (!isEverydayWorry12ConfigurationValid(quiz)) notFound();
    return <EverydayWorryPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "mood-observations12") {
    if (!isRecentMood12ConfigurationValid(quiz)) notFound();
    return <RecentMoodPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "mood-activity16") {
    if (!isMoodActivity16ConfigurationValid(quiz)) notFound();
    return <MoodActivityPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "cycle-context16") {
    if (!isCycleContext16ConfigurationValid(quiz)) notFound();
    return <CycleContextPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "birth-context16") {
    if (!isBirthContext16ConfigurationValid(quiz)) notFound();
    return <BirthContextPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "season-context16") {
    if (!isSeasonContext16ConfigurationValid(quiz)) notFound();
    return <SeasonContextPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "health-worries21") {
    if (!isHealthWorry21ConfigurationValid(quiz)) notFound();
    return <HealthWorryPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "sleep-experiences20") {
    if (!isSleepExperiences20ConfigurationValid(quiz)) notFound();
    return <SleepExperiencesPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "bereavement16") {
    if (!isBereavement16ConfigurationValid(quiz)) notFound();
    return <BereavementPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "weton-story35") {
    if (!isWetonStory35ConfigurationValid(quiz)) notFound();
    return <WetonStory35Page quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "bpi21") {
    if (!isBpi21ConfigurationValid(quiz)) notFound();
    return <Bpi21Page quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "eating-experiences20") {
    if (!isEatingExperiences20ConfigurationValid(quiz)) notFound();
    return <EatingExperiencesPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "gender-experiences16") {
    if (!isGenderExperiences16ConfigurationValid(quiz)) notFound();
    return <GenderExperiencesPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "emotions-connections21") {
    if (!isEmotionsConnections21ConfigurationValid(quiz)) notFound();
    return <EmotionsConnectionsPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "feedback-worth12") {
    if (!isFeedbackWorth12ConfigurationValid(quiz)) notFound();
    return <FeedbackWorthPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "uncertainty-ease6") {
    if (!isUncertaintyEase6ConfigurationValid(quiz)) notFound();
    return <UncertaintyEasePage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "drinking-experiences20") {
    if (!isDrinkingExperiences20ConfigurationValid(quiz)) notFound();
    return <DrinkingExperiencesPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "support-reflection18") {
    if (!isSupportReflection18ConfigurationValid(quiz)) notFound();
    return <SupportReflectionPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "connection-checkin21") {
    if (!isConnectionCheckIn21ConfigurationValid(quiz)) notFound();
    return <ConnectionCheckInPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "pressure-actions12") {
    if (!isPressureActions12ConfigurationValid(quiz)) notFound();
    return <PressureActionsPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "trauma-response20") {
    if (!isTraumaResponse20ConfigurationValid(quiz)) notFound();
    return <TraumaResponsePage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "distributed-work24") {
    if (!isDistributedWork24ConfigurationValid(quiz)) notFound();
    return <DistributedWorkPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "written-coordination") {
    if (!isWrittenCoordinationConfigurationValid(quiz)) notFound();
    return <WrittenCoordinationPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "sbti31") {
    if (!isSbti31ConfigurationValid(quiz)) notFound();
    return <Sbti31Page quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "mattering10") {
    if (!isMattering10ConfigurationValid(quiz)) notFound();
    return <Mattering10Page quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "eq-dashboard" && quiz) {
    if (!isQuestionnaireConfigurationValid(quiz)) notFound();
    return <EmotionDashboardPage quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "values-assessment" && quiz) {
    if (!isQuestionnaireConfigurationValid(quiz)) notFound();
    return <WorkValuesPage quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "food-choice" && quiz) {
    if (!isQuestionnaireConfigurationValid(quiz)) notFound();
    return <FoodChoicePage quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "cultural-dimensions" && quiz) {
    if (!isQuestionnaireConfigurationValid(quiz)) notFound();
    return <CulturalDimensionsPage quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "deep-desire" && quiz) {
    if (!isQuestionnaireConfigurationValid(quiz)) notFound();
    return <DeepDesirePage quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "overthinking-screener" && quiz) {
    if (!isQuestionnaireConfigurationValid(quiz)) notFound();
    return <PtqPage quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "skills-audit" && quiz) {
    if (!isQuestionnaireConfigurationValid(quiz)) notFound();
    return <SkillsAuditPage quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "culture-fit" && quiz) {
    if (!isQuestionnaireConfigurationValid(quiz)) notFound();
    return <CultureFitPage quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "work-ethics" && quiz) {
    if (!isQuestionnaireConfigurationValid(quiz)) notFound();
    return <WorkEthicsPage quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "number-series" && quiz) {
    if (!isQuestionnaireConfigurationValid(quiz)) notFound();
    return <NumberSeriesPage quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "superpower-test" && quiz) {
    if (!isQuestionnaireConfigurationValid(quiz)) notFound();
    return <SuperpowerPage quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "mythical-creature" && quiz) {
    if (!isQuestionnaireConfigurationValid(quiz)) notFound();
    return <MythicalCreaturePage quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "what-dog-breed-am-i" && quiz) {
    if (!isQuestionnaireConfigurationValid(quiz)) notFound();
    return <DogBreedPage quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "spirit-animal" && quiz) {
    if (!isQuestionnaireConfigurationValid(quiz)) notFound();
    return <SpiritAnimalPage quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "social-battery-test" && quiz) {
    if (!isQuestionnaireConfigurationValid(quiz)) notFound();
    return <SocialBatteryPage quiz={quiz} locale={locale} take={take} />;
  }
  if (slug === "perceived-stress-scale-4" && quiz) {
    const validPss4 = Boolean(isPss4ConfigurationValid(quiz));
    if (!validPss4) notFound();
    return <Pss4Page quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.slug === "cognitive-functions-test") return <CognitiveFunctionsPage quiz={quiz} locale={locale} />;

  if (quiz?.kind === "dvmsq18") {
    if (!isDvmsq18ConfigurationValid(quiz)) notFound();
    return <Dvmsq18Page quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "synes15") {
    if (!isSynes15ConfigurationValid(quiz)) notFound();
    return <Synes15Page quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "reasoning18") {
    if (!isReasoning18ConfigurationValid(quiz)) notFound();
    return <Reasoning18Page quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "critical30") {
    if (!isCritical30ConfigurationValid(quiz)) notFound();
    return <Critical30Page quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "technical30") {
    if (!isTechnical30ConfigurationValid(quiz)) notFound();
    return <Technical30Page quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "afqt32") {
    if (!isAfqt32ConfigurationValid(quiz)) notFound();
    return <Afqt32Page quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "anger20") {
    if (!isAnger20ConfigurationValid(quiz)) notFound();
    return <Anger20Page quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "sens16") {
    if (!isSens16ConfigurationValid(quiz)) notFound();
    return <Sens16Page quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "imagery12") {
    if (!isImagery12ConfigurationValid(quiz)) notFound();
    return <Imagery12Page quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "imposter20") {
    if (!isImposter20ConfigurationValid(quiz)) notFound();
    return <Imposter20Page quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "catq25") {
    if (!isCatQ25ConfigurationValid(quiz)) notFound();
    return <CatQ25Page quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "most-least") {
    if (!isMostLeastConfigurationValid(quiz)) notFound();
    return <MostLeastPage quiz={quiz} locale={locale} take={take} />;
  }
  if (quiz?.kind === "love-type16" && !isLoveType16ConfigurationValid(quiz)) notFound();
  if (((quiz?.kind === "mini-virtues" || quiz?.slug === "seven-sins-virtues-test") && !isMiniVirtuesConfigurationValid(quiz)) || (quiz?.slug === "euphoria-character-quiz" && !isEuphoriaConfigurationValid(quiz))) notFound();
  if (quiz?.kind === "nine-star-year") {
    if (!isNineStarYearConfigurationValid(quiz)) notFound();
    return <NineStarYearPage quiz={quiz} locale={locale} />;
  }
  if (quiz?.kind === "natal-chart") {
    if (!isNatalChartConfigurationValid(quiz)) notFound();
    return <NatalChartPage quiz={quiz} locale={locale} />;
  }
  if (quiz?.kind === "career-theme-compare") {
    if (!isCareerMatchConfigurationValid(quiz)) notFound();
    return <CareerMatchPage quiz={quiz} locale={locale} />;
  }
  if (quiz?.kind === "birth-number") {
    if (!isBirthNumberConfigurationValid(quiz)) notFound();
    return <BirthNumberPage quiz={quiz} locale={locale} />;
  }
  if (!quiz || (quiz.kind === "fds32" && !isFds32ConfigurationValid(quiz)) || (quiz.kind === "mental-age" && !isMentalAgeConfigurationValid(quiz)) || (quiz.kind === "pss4" && !isPss4ConfigurationValid(quiz)) || (quiz.kind === "stress-reflection4" && !isStressReflection4ConfigurationValid(quiz)) || (quiz.kind === "mini-orientation" && !isMiniOrientationConfigurationValid(quiz)) || (quiz.kind === "mini-conflict" && !isMiniConflictConfigurationValid(quiz)) || (quiz.kind === "four-axes" && !isFourAxesConfigurationValid(quiz)) || (quiz.kind === "mini-shadow" && !isMiniShadowConfigurationValid(quiz)) || (quiz.kind === "preparation-actions20" && !isPreparationActions20ConfigurationValid(quiz)) || (quiz.kind === "mini-coping" && !isMiniCopingConfigurationValid(quiz)) || (quiz.kind === "mini-habit" && !isMiniHabitConfigurationValid(quiz)) || (quiz.kind === "mini-intimacy" && !isMiniIntimacyConfigurationValid(quiz)) || (quiz.kind === "mini-breakup" && !isMiniBreakupConfigurationValid(quiz)) || (quiz.kind === "holding-back35" && !isHoldingBack35ConfigurationValid(quiz)) || (quiz.kind === "fscrs22" && !isFscrs22ConfigurationValid(quiz)) || (quiz.kind === "parenting-practices" && !isParentingPracticesConfigurationValid(quiz)) || (quiz.kind === "spq92" && !isSpq92ConfigurationValid(quiz)) || (quiz.kind === "adexi14" && !isAdexi14ConfigurationValid(quiz)) || (quiz.kind === "mini-friction" && !isMiniFrictionConfigurationValid(quiz)) || (quiz.kind === "ctl41" && !isCtl41ConfigurationValid(quiz)) || (quiz.kind === "ptq15" && !isPtq15ConfigurationValid(quiz)) || (quiz.kind === "interaction-pairs" && !isInteractionPairsConfigurationValid(quiz)) || (quiz.kind === "work-role12" && !isWorkRole12ConfigurationValid(quiz)) || (quiz.kind === "skills-evidence" && !isSkillsEvidenceConfigurationValid(quiz)) || (quiz.slug === "dark-tetrad-sd4" && !isSd4ConfigurationValid(quiz)) || (quiz.kind === "tipi10" && !isTipi10ConfigurationValid(quiz)) || (quiz.kind === "saps" && !isSapsConfigurationValid(quiz)) || (quiz.kind === "scs26" && !isScs26ConfigurationValid(quiz)) || (quiz.kind === "cbi" && !isCbiConfigurationValid(quiz)) || (quiz.kind === "rosenberg" && !isRosenbergConfigurationValid(quiz)) || (quiz.kind === "political-coordinates" && !isPoliticalCoordinatesConfigurationValid(quiz)) || (quiz.kind === "data-entry" && !isDataEntryConfigurationValid(quiz)) || (quiz.kind === "secs" && !isSecsConfigurationValid(quiz)) || (quiz.kind === "paired-dimensions" && !isPairedDimensionsConfigurationValid(quiz)) || (quiz.kind === "typing" && !isTypingConfigurationValid(quiz))) notFound();
  if (!isQuestionnaireConfigurationValid(quiz)) throw new Error("QUESTIONNAIRE_CONFIGURATION_UNAVAILABLE");
  if (quiz.slug === "connection-meaning-reflection") return <ConnectionMeaningPage quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} take={take} />;
  if (quiz.slug === "body-frame-observations") return <BodyFrameObservationsPage quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} take={take} />;
  if (quiz.slug === "connection-ideals") return <ConnectionIdealsPage quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} take={take} />;
  if (quiz.slug === "activity-engagement-patterns") return <ActivityEngagementPage quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} take={take} />;
  if (quiz.slug === "style-impression-preferences") return <StyleImpressionPage quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} take={take} />;
  if (quiz.slug === "outfit-line-preferences") return <OutfitLinePreferencesPage quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} take={take} />;
  if (quiz.kind === "data-entry") return <DataEntryPage quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} take={take} />;
  if (quiz.kind === "typing") return <TypingPage quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} take={take} />;
  if (quiz.kind === "ten-key") return <TenKeyPage quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} take={take} />;
  const readingProfiles = quiz.profiles.map(profile => prepareResultProfile(quiz.slug, profile));
  const resultReadingProps = (() => {
    if (quiz.kind === "mental-age") return { mentalAgeReadingProfile: readingProfiles[0] };
    if (quiz.kind === "love-type16") return { loveTypeReadingProfiles: readingProfiles };
    if (quiz.kind === "work-role12") return { workRoleReadingProfiles: readingProfiles };
    if (quiz.kind === "fds32") return { fds32ReadingProfiles: readingProfiles };
    if (quiz.kind === "mini-breakup") return { breakupReadingProfiles: readingProfiles };
    if (quiz.kind === "parenting-practices") return { parentingReadingProfiles: readingProfiles };
    return {};
  })();
  const engine = (() => {
if (quiz.kind === "mini-orientation") return <QuestionnaireOrientationClient quiz={quiz} locale={locale} readingProfiles={readingProfiles} />;
if (quiz.kind === "mini-conflict") return <QuestionnaireConflictClient quiz={quiz} locale={locale} readingProfiles={readingProfiles} />;
if ((quiz.kind === "stress-reflection4" || quiz.kind === "pss4")) return <QuestionnaireStressCheckInClient quiz={quiz} locale={locale} resultProfile={readingProfiles[0]} />;
if (quiz.kind === "four-axes") return <QuestionnaireFourAxesClient quiz={quiz} locale={locale} readingProfiles={readingProfiles} />;
if (quiz.kind === "mini-shadow") return <QuestionnaireShadowClient quiz={quiz} locale={locale} readingProfiles={readingProfiles} />;
if (quiz.kind === "mini-coping") return <QuestionnaireCopingClient quiz={quiz} locale={locale} readingProfiles={readingProfiles} />;
if (quiz.kind === "mini-habit") return <QuestionnaireHabitClient quiz={quiz} locale={locale} readingProfiles={readingProfiles} />;
if (quiz.kind === "mini-intimacy") return <QuestionnaireIntimacyClient quiz={quiz} locale={locale} readingProfiles={readingProfiles} />;
if (quiz.kind === "fscrs22") return <QuestionnaireFscrs22Client quiz={quiz} locale={locale} readingProfiles={readingProfiles} />;
if (quiz.slug === "connection-ideals") return <ConnectionIdealsClient key={`${slug}:${locale}`} quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} />;
if (quiz.slug === "style-impression-preferences") return <StyleImpressionClient key={`${slug}:${locale}`} quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} />;
if (quiz.slug === "connection-meaning-reflection") return <ConnectionMeaningClient key={`${slug}:${locale}`} quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} />;
if (quiz.slug === "body-frame-observations") return <BodyFrameObservationsClient key={`${slug}:${locale}`} quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} />;
if (quiz.slug === "activity-engagement-patterns") return <ActivityEngagementClient key={`${slug}:${locale}`} quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} />;
if (quiz.slug === "outfit-line-preferences") return <OutfitLinePreferencesClient key={`${slug}:${locale}`} quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} />;
if (quiz.slug === "attraction-experiences") return <AttractionExperiencesClient key={`${slug}:${locale}`} quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} />;
if (quiz.slug === "dark-tetrad-sd4") return <QuestionnaireSd4Client key={`${slug}:${locale}`} quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} />;
if (quiz.slug === "dark-triad") return <QuestionnaireDarkTriadClient key={`${slug}:${locale}`} quiz={prepareQuestionnaireResultReadings(quiz)} locale={locale} />;
return <QuestionnaireClient quiz={Object.keys(resultReadingProps).length ? quiz : prepareQuestionnaireResultReadings(quiz)} locale={locale} {...resultReadingProps} />;
})();
  if (take) return engine;
  const gapEditorial = completionGapEditorial[slug];
  const resultGuide = quiz.slug === "delulu-test" ? prepareQuestionnaireResultReadings(quiz).guide : quiz.guide;
  const path = questionnairePath(locale, slug);
  const entryMethodSection = quiz.kind === "practice" ? ({ "excel-skills": "practice-counts", "abstract-reasoning": "counts", "numerical-reasoning": "scoring", "digital-ethics-citizenship": "counts", "number-series": "scoring", "mechanical-reasoning": "counts", "spatial-reasoning": "counts", "situational-judgement": "practice-score", "german-proficiency": "practice-count", "customer-service-aptitude": "practice-count", "communication-adaptability": "practice-key" } as Record<string, string>)[slug] : slug === "chinese-zodiac" && quiz.kind === "archetype" ? "symbolic-method" : ({
    "love-personality": quiz.kind === "directional" ? "raw-count-method" : undefined,
    "toxic-positivity-test": quiz.kind === "likert" ? "method" : undefined,
    "mental-age": quiz.kind === "mental-age" ? "calculation" : undefined,
    "energy-flow": quiz.kind === "likert" ? "calculation" : undefined,
    "food-disgust": quiz.kind === "fds32" ? "calculation" : undefined,
    "food-choice": quiz.kind === "directional" ? "counting" : undefined,
    "everyday-control-style": quiz.kind === "likert" ? "response-map" : undefined,
    "interpersonal-preferences": quiz.kind === "likert" ? "method" : undefined,
    "social-attitudes-reflection": quiz.kind === "likert" ? "method" : undefined,
    "work-activity-interests": quiz.kind === "likert" ? "respond" : undefined,
    "dating-outlook": quiz.kind === "likert" ? "method" : undefined,
    "face-self-image": quiz.kind === "likert" ? "method" : undefined,
  } as Record<string, string | undefined>)[slug];
  const referenceNote = (() => {
if (isFscrs22ConfigurationValid(quiz)) return quiz.fscrs22.attribution[locale];
if (quiz.kind === "parenting-practices") return (zh ? "题目、计分和例子均由费马原创。四种养育风格只作通用框架；所列背景资料不提供本题本、常模或分型阈值，也不代表其作者背书。" : "Items, scoring and examples are original FermatMind content. The four styles are a general framework; background references do not supply this bank, norms or type cutoffs, or imply author endorsement.");
if (quiz.kind === "spq92") return quiz.guide.find(section => section.id === "source")?.paragraphs[0]?.[locale];
if (quiz.kind === "adexi14") return (zh ? "采用作者官网提供的ADEXI成人自评英文和Angela Siu简体中文现有版本，保留题文、题序与五个源锚点。作者说明使用已提供语言版本无需作者许可。本网站完整度政策和读法不表示作者背书或跨语言验证。" : "Uses the existing ADEXI adult self-report English and Angela Siu simplified-Chinese versions supplied on the authors’ website, retaining wording, order and five source anchors. The authors state that existing language versions may be used without author permission. Website completeness rules and guides do not imply author endorsement or cross-language validation.");
if (quiz.kind === "ptq15") return (zh ? "Ehring等（2011）正式论文的附录提供英文十五题、原选项和计分；依原PDF所链接的CC BY 3.0保留完整署名。中文为费马新工作译文；新增不计分选项与网页说明尚未验证，不暗示原作者背书。" : "The appendix to Ehring et al. (2011) supplies the fifteen English items, original anchors and scoring. Complete attribution follows CC BY 3.0 as linked by the source PDF. Chinese is a new FermatMind working translation; the added unscored option and web presentation have not been validated or endorsed by the original authors.");
if (["social-intelligence-test", "character-strengths", "locus-of-control", "empathy"].includes(quiz.slug)) return (zh ? "官方IPIP来源提供英文条目、键向与许可；中文试译和网站呈现尚无本地验证或跨语言等价证据。" : "Official IPIP sources supply English items, keying and permission. The Chinese trial translation and website presentation have no local validation or established language equivalence.");
if ((quiz.kind === "extraversion" || quiz.kind === "optimism")) return (zh ? "这些来源提供公有领域英文条目、键向和许可。中文译文、网站分区与解释尚无本站常模或跨语言等价验证。" : "These sources supply public-domain English items, keying and permission. The Chinese translation, website bands and explanations have no local norms or established cross-language equivalence.");
if (quiz.kind === "tipi10") return (zh ? "作者公开原页提供英文十组特质、七级选项、五对计分及任何目的使用许可。本站中文为独立工作译文，未建立本地常模、独立验证或跨语言等价；不表示原作者为本站背书。" : "The original author’s public pages supply ten English trait pairs, seven anchors, five scoring pairs and permission for any purpose. Chinese is an independent website working translation without local norms, independent validation, established language equivalence or original-author endorsement.");
if (quiz.kind === "saps") return (zh ? "作者SAPS专项说明与正式源页提供英文八题、七级选项和分维计分；使用及工作翻译按作者说明保留引用。中文与网页呈现尚未独立验证，不继承人群常模、跨语言等价或原作者背书。" : "The author’s SAPS-specific notice and source sheet supply eight English items, seven anchors and separate dimension scoring, with attribution for use and translation. The working Chinese and web presentation have no independent validation, population norms, established language equivalence or original-author endorsement.");
if (quiz.kind === "scs26") return (zh ? "Neff（2003）及当前官方资料提供完整26题英文、许可与反向键；中文为费马新工作译本，尚无实证验证或跨语言等值证据。六部分均值等权平均，不使用非正式高低分档或诊断。" : "Neff (2003) and current official materials supply the full 26 English items, permission and reverse keys. Chinese is a new FermatMind working translation without empirical validation or established language equivalence. Six part means are equally weighted; no informal high/low bands or diagnoses are applied.");
if (quiz.kind === "cbi") return (zh ? "NFA提供本版采用的两个完整英文模块、原选项与计分及商业使用条件；按要求引用Borritz等（2006）。新工作中译、NA与呈现不自动继承源研究效度；均分不是风险概率、诊断或人口排名。" : "NFA supplies the two complete English modules, source response formats, scoring and permission for commercial use, with the required Borritz et al. (2006) citation. The working translation, NA and presentation do not automatically inherit source validation. Means are not risk probabilities, diagnoses or population ranks.");
if (quiz.kind === "rosenberg") return (zh ? "马里兰大学原始条目与计分说明是本版英文和反向键的来源；中文为本站工作译文，其效度与跨语言等值尚未建立。原始总分不是诊断、个人价值或人口排名。" : "University of Maryland item and scoring notices supply this edition’s English source and reverse keys. Chinese is a website working translation without established validity or cross-language equivalence. The raw total is not a diagnosis, personal worth or population rank.");
if (quiz.kind === "alignment") return (zh ? "这些来源说明角色框架与许可，不验证本版题目或计分分区。" : "These sources explain the character framework and licence; they do not validate this edition’s items or display bands.");
return null;
})();
  const hasInlineReferences = ["attraction-experiences", "dark-tetrad-sd4", "work-traits-reflection", "relationship-worry-habits", "face-self-image", "work-role-reflection", "dating-outlook", "relationship-habits", "intimacy-values", "work-activity-interests", "tipi-10", "social-attitudes-reflection", "interpersonal-preferences", "everyday-control-style", "love-type-16", "food-disgust", "energy-flow", "mental-age", "stupidity-test", "tech-savvy", "orientation-exploration-test", "sake-type", "stress-check-in-test", "conflict-boundary-behaviors-test", "four-axes-test", "seven-sins-virtues-test", "stress-response-patterns-test", "remote-work", "freelance-ready", "coping-rhythm-test", "habit-patterns-test", "intimacy-preference-test", "breakup-reflection-test", "holding-yourself-back", "inner-critic-voice-test", "parenting-style", "sensory-processing-test", "competency-test", "hsp-sensitivity-quiz", "executive-function", "capacity-to-love-test", "love-fight-style", "annoying-person-test", "sternberg-love", "jealousy-scale", "mote-type", "apology-language", "perfectionism", "friendship-compatibility", "toxic-positivity-test", "conflict-styles", "communication-adaptability", "self-compassion", "wholesome-partner", "burnout-risk", "time-management", "self-esteem", "morality-6", "trust-issues-test", "libertarian", "spatial-reasoning", "mechanical-reasoning", "political-coordinates", "relationship-commitment", "freudian-personality", "adult-age-preferences", "digital-ethics-citizenship", "numerical-reasoning", "conservatism", "abstract-reasoning", "relationship-preferences", "hexaco", "relationship-values", "8-values-political", "situational-judgement", "love-personality", "zodiac-sign-quiz", "german-proficiency", "customer-service-aptitude", "chinese-zodiac", "ai-literacy", "personal-finance-literacy", "rizz-test", "project-management", "word-skills", "problem-solving-critical-thinking", "sql-test", "color-season", "sales-aptitude", "python-test", "javascript-test", "logical-reasoning", "eras-of-you-test", "financial-accounting", "java-test", "excel-skills", "feminine-energy", "computer-literacy", "verbal-reasoning", "big-fish-energy-test", "barbie-character", "apocalypse-survival-type-test", "disc", "response-color", "moral-alignment", "jungian-archetype", "introvert-extrovert", "temperament", "love-languages", "attachment-styles", "communication-style", "leadership-style", "humor-style-test", "travel-personality-test", "aesthetic-core-test", "music-taste-test", "people-pleaser", "difficult-person-test", "likable-person-test", "procrastinator-type-test", "learning-style", "character-strengths", "tsundere-dere-type", "hogwarts-house-quiz", "greek-god", "which-tarot-card-are-you", "what-element-am-i", "aura-color", "past-life", "moon-phase", "bojack-horseman-character-quiz", "chiikawa", "disney-princess", "naruto-character", "death-note", "bleach", "star-wars-character", "hello-kitty", "dungeons-dragons-class", "type-ab", "sdt-motivation", "socionics", "optimism-pessimism", "values", "light-triad-test", "inner-child-personality-test", "philosopher-personality-test", "inkblot-personality-quiz", "arabic-personality-compass", "maturity-test", "growth-mindset-fixed-mindset", "locus-of-control", "intelligence-type-test", "toxic-trait", "grit-test", "ikigai", "male-archetype-test", "social-intelligence-test", "egogram", "moral-dilemma-test", "dark-triad", "next-life", "ginny-and-georgia-character-quiz", "hazbin-hotel-character-quiz", "my-hero-academia-character-quiz", "my-little-pony-character-quiz", "attention-to-detail", "wojak", "cybersecurity-awareness", "delulu-test", "nana-character", "workplace-technology", "south-park", "gilmore-girls", "aptitude-test", "jujutsu-kaisen-character", "egen-teto", "harry-potter-character", "spelling-test", "dexter", "avengers-character", "stranger-things", "wednesday-addams-character", "twilight-character", "decade-aesthetic-test", "game-of-thrones", "amazing-digital-circus", "gossip-girl", "english-proficiency", "villain-era-archetype-test", "blue-lock", "anime-character-archetype-test", "grammar-test", "hundred-acre-wood-friend-quiz", "space-marine-chapter", "spanish-proficiency"].includes(slug);
  const referencePrefix = slug;
  const renderCopy = (text: string) => {
    if (!hasInlineReferences) return text;
    // In code-reading prose, indexed expressions remain source text, not reference markers.
    if (["java-test", "python-test"].includes(slug)) return text.split(/((?<=[.!?。！？])\s*\[\d+\](?:\[\d+\])*)/g).map((part, index) =>
      /^\s*\[\d+\]/.test(part) ? <DiscCitations key={index} text={part} locale={locale} referencePrefix={referencePrefix} /> : part);
    return <DiscCitations text={text} locale={locale} referencePrefix={referencePrefix} />;
  };
  const entryLabel = (() => {
if (quiz.slug === "eq-dashboard") return (zh ? "原创40条八情绪回顾 · 非EQ能力分" : "40 original emotion prompts · No EQ ability score");
if (quiz.slug === "values-assessment") return (zh ? "原创30题工作取舍 · 十篇全文免费" : "30 original work-priority choices · Ten full guides free");
if (quiz.slug === "food-choice") return (zh ? "原创12组菜单线索比较 · 七篇全文免费" : "12 original menu-cue comparisons · Seven full guides free");
if (quiz.slug === "cultural-dimensions") return (zh ? "原创36条六主题反思 · 六篇全文免费" : "36 original cultural-theme statements · Six full guides free");
if (quiz.kind === "love-type16") return (zh ? "原创32题四轴 · 16篇全文免费" : "32 original four-axis choices · 16 full guides free");
if (quiz.slug === "cognitive-functions-test") return (zh ? "原创32题八功能反思 · 八篇全文免费" : "32 original function-theme prompts · Eight full guides free");
if (quiz.kind === "fds32") return (zh ? "发表FDS完整32题 · 八份读法免费" : "32 published FDS items · Eight full guides free");
if (quiz.kind === "mental-age") return (zh ? "原创12题娱乐年龄 · 完整读法免费" : "12 original playful-age choices · Full guide free");
if (quiz.slug === "stupidity-test") return (zh ? "原创日常乌龙选择 · 六篇全文免费" : "Original everyday mix-up choices · Six full guides free");
if (quiz.kind === "mini-orientation") return (zh ? "原创20题非分类观察 · 五篇全文免费" : "20 original non-classifying statements · Five full guides free");
if (quiz.kind === "mini-conflict") return (zh ? "原创24题行为观察 · 四篇全文免费" : "24 original behavior statements · Four full guides free");
if (quiz.kind === "mini-virtues") return (zh ? "十四项独立读数 · 全文免费" : "Fourteen independent scores · Full guides free");
if (quiz.slug === "euphoria-character-quiz") return (zh ? "非官方同人编辑 · 第一、二季" : "Unofficial fan edition · Seasons 1–2");
if (quiz.kind === "pss4") return (zh ? "PSS-4英文四题 · 本站中文译文 · 完整指南免费" : "Published English PSS-4 · Site Chinese translation · Full guide free");
if (quiz.kind === "stress-reflection4") return (zh ? "原创四题月度回看 · 完整解读免费" : "Four original monthly prompts · Full guide free");
if (quiz.kind === "four-axes") return (zh ? "原创60题四轴自画像 · 四篇全文免费" : "60 original statements · Four full guides free");
if (quiz.kind === "mini-shadow") return (zh ? "原创20题近期反应观察 · 五篇全文免费" : "20 original recent-response statements · Five full guides free");
if (quiz.kind === "preparation-actions20") return (zh ? "原创20项准备行动回顾 · 五篇全文免费" : "20 original preparation actions · Five full guides free");
if (quiz.kind === "mini-coping") return (zh ? "原创24题应对选择 · 四组全文免费" : "24 original coping choices · Four full guides free");
if (quiz.kind === "mini-habit") return (zh ? "原创20题日常习惯观察 · 五篇全文免费" : "20 original everyday-habit statements · Five full guides free");
if (quiz.kind === "mini-intimacy") return (zh ? "原创24题亲密偏好 · 四篇全文免费" : "24 original adult-preference items · Four full guides free");
if (quiz.kind === "mini-breakup") return (zh ? "原创24题关系复盘 · 四组全文免费" : "24 original breakup-reflection items · Four full guides free");
if (quiz.kind === "holding-back35") return (zh ? "原创35题日常观察 · 七份完整指南免费" : "35 original everyday scenarios · Seven complete guides free");
if (isFscrs22ConfigurationValid(quiz)) return quiz.fscrs22.subtitle[locale];
if (quiz.kind === "mini-friction") return (zh ? "日常互动自评 · 五篇完整解读免费" : "Everyday interaction reflection · Five full guides free");
if (quiz.kind === "ctl41") return (zh ? "2018源题文工作译版 · 六篇全文免费" : "2018 source items · Working edition · Six full guides free");
if (quiz.kind === "parenting-practices") return (zh ? "原创12题养育行为回顾 · 四份完整指南免费" : "12 original parenting-response items · Four full guides free");
if (quiz.kind === "spq92") return (zh ? "完整92项SPQ · 工作中译 · 完整读法免费" : "Full 92-item SPQ · Working Chinese · Full guide, free");
if (quiz.kind === "adexi14") return (zh ? "ADEXI14题自评 · 三份完整读法免费" : "ADEXI-14 self-report · Three full readings free");
if (quiz.kind === "ptq15") return (zh ? "PTQ15原文与工作译文 · 完整读法免费" : "PTQ 15 original text and working translation · Full guides free");
if (quiz.kind === "interaction-pairs") return (zh ? "互动情境配对选择 · 四份完整解读免费" : "Paired choices in everyday interactions · Four full guides free");
if (quiz.kind === "work-role12") return (zh ? "原创12项角色回顾 · 三份完整读法免费" : "12 original task contexts · Three full guides free");
if (quiz.kind === "skills-evidence") return (zh ? "原创任务实例盘点 · 四份完整读法免费" : "Original task-example inventory · Four full guides free");
if (quiz.slug === "dark-tetrad-sd4") return (zh ? "SD4发表版28题 · 四项独立均值" : "Published SD4 28 · Four separate means");
if (quiz.kind === "tipi10") return (zh ? "TIPI英文原十题 · 费马工作中译" : "Original TIPI ten English items · Working Chinese translation");
if (quiz.kind === "saps") return (zh ? "SAPS源八题 · 工作中译" : "SAPS eight-item source edition");
if (quiz.kind === "scs26") return (zh ? "SCS26题依许可使用 · 七份完整读法免费" : "Licensed SCS-26 items · Seven full readings free");
if (quiz.kind === "cbi") return (zh ? "CBI两个完整源模块 · 完整读法免费" : "Two complete CBI source modules · Full guides free");
if (quiz.kind === "rosenberg") return (zh ? "RSES公有领域条目 · 原始总分与完整读法免费" : "RSES public-domain items · Raw total and full guide free");
if (quiz.slug === "morality-6") return (zh ? "MFQ-2授权原题 · 六项完整读法免费" : "Licensed MFQ-2 items · Six full guides free");
if (quiz.kind === "political-coordinates") return (zh ? "原创公共政策取舍版 · 两轴与四份完整指南免费" : "Original policy-choice edition · Two axes and four full guides free");
if (quiz.kind === "secs") return (zh ? "SECS2013美国议题 · 两份完整读法免费" : "SECS 2013 U.S. issues · Two full guides free");
if (quiz.slug === "hexaco") return (zh ? "preliminary IPIP240条 · 六域完整读法免费" : "Preliminary IPIP 240 items · Six full domain guides free");
if (quiz.kind === "eight-values") return (zh ? "8values MIT许可改编 · 完整结果免费" : "8values MIT adaptation · Full results free");
if (quiz.slug === "color-season") return (zh ? "原创可见配色偏好 · 四份完整指南免费" : "Original visible palette preferences · Four full guides free");
if (quiz.kind === "practice") return (zh ? "原创练习题 · 逐题解析与复习说明免费" : "Original practice bank · All explanations and revision guides free");
if (quiz.slug === "dark-triad") return (zh ? "原创三组主题观察 · 公开预览 · 完整结果免费" : "Original three-theme reflection · Public preview · Full results free");
if (quiz.slug === "moral-dilemma-test") return (zh ? "原创五组伦理提问 · 完整结果免费" : "Original reflection on five ethical questions · Full results free");
if (quiz.slug === "egogram") return (zh ? "原创五组互动观察 · 完整结果免费" : "Original reflection on five interaction stances · Full results free");
if (quiz.slug === "social-intelligence-test") return (zh ? "IPIP-VIA-R四条自述 · 完整结果免费" : "Four IPIP-VIA-R self-reports · Full results free");
if (quiz.slug === "male-archetype-test") return (zh ? "原创四角色隐喻版 · 完整结果免费" : "Original four-role metaphor edition · Full results free");
if (quiz.slug === "ikigai") return (zh ? "原创四组交叠探索 · 完整结果免费" : "Original four-overlap exploration · Full results free");
if (quiz.slug === "grit-test") return (zh ? "原创长期目标回顾 · 完整结果免费" : "Original long-term-goal reflection · Full results free");
if (quiz.slug === "toxic-trait") return (zh ? "原创互动习惯自我观察 · 完整结果免费" : "Original interaction-habits reflection · Full results free");
if (quiz.slug === "intelligence-type-test") return (zh ? "原创思考入口趣味版 · 完整结果免费" : "Original thinking-approach quiz · Full results free");
if (["locus-of-control", "empathy"].includes(quiz.slug)) return (zh ? "IPIP公有领域条目 · 完整结果免费" : "Public-domain IPIP items · Full results free");
if (quiz.slug === "growth-mindset-fixed-mindset") return (zh ? "原创学习信念自评 · 完整结果免费" : "Original learning-belief reflection · Full results free");
if (quiz.slug === "maturity-test") return (zh ? "原创成熟度自我观察 · 完整结果免费" : "Original maturity self-reflection · Full results free");
if (quiz.kind === "compass") return (zh ? "原创四向罗盘反思 · 完整结果免费" : "Original four-direction compass reflection · Full results free");
if (quiz.slug === "inkblot-personality-quiz") return (zh ? "原创墨迹视觉趣味 · 完整结果免费" : "Original inkblot visual quiz · Full results free");
if (quiz.slug === "character-strengths") return (zh ? "IPIP-VIA-R公有领域条目 · 完整结果免费" : "Public-domain IPIP-VIA-R items · Full results free");
if (quiz.slug === "likable-person-test") return (zh ? "自有互动选择自评 · 完整结果免费" : "Original interaction reflection · Full results free");
if (quiz.slug === "people-pleaser") return (zh ? "PPS条目自评 · 完整结果免费" : "PPS item reflection · Full results free");
if (quiz.kind === "attachment") return (zh ? "原创依恋情境自评 · 完整结果免费" : "Original attachment reflection · Full results free");
if (quiz.kind === "affection") return (zh ? "原创双向爱语自评 · 完整结果免费" : "Original love-language reflection · Full results free");
if (quiz.slug === "aesthetic-core-test") return (zh ? "原创视觉偏好自评 · 完整结果免费" : "Original aesthetic reflection · Full results free");
if (quiz.slug === "travel-personality-test") return (zh ? "原创旅行偏好自评 · 完整结果免费" : "Original travel reflection · Full results free");
if (quiz.slug === "leadership-style") return (zh ? "原创领导情境自评 · 完整结果免费" : "Original leadership reflection · Full results free");
if (quiz.slug === "light-triad-test") return (zh ? "发表LTS条目自评 · 完整结果免费" : "Published LTS item reflection · Full results free");
if (quiz.slug === "values") return (zh ? "原创价值目标反思 · 完整结果免费" : "Original value reflection · Full results free");
if (quiz.slug === "socionics") return (zh ? "原创四组价值观察 · 完整结果免费" : "Original quadra value reflection · Full results free");
if (quiz.slug === "temperament") return (zh ? "原创古典气质自评 · 完整结果免费" : "Original classical-style reflection · Full results free");
if ((quiz.kind === "extraversion" || quiz.kind === "optimism")) return (zh ? "IPIP公有领域条目自评 · 完整结果免费" : "Public-domain IPIP item reflection · Full results free");
if (quiz.kind === "alignment") return (zh ? "原创阵营问卷 · 完整结果免费" : "Original alignment reflection · Full results free");
if (quiz.slug === "connection-ideals") return (zh ? "原创连接偏好 · 完整结果免费" : "Original connection reflection · Full results free");
if (quiz.slug === "style-impression-preferences") return (zh ? "原创造型偏好 · 完整结果免费" : "Original style reflection · Full results free");
if (quiz.kind === "archetype") return (zh ? "原创象征测验 · 完整结果免费" : "Original symbolic quiz · Full results free");
if (quiz.slug === "connection-meaning-reflection") return (zh ? "原创连接反思 · 五篇全文免费" : "Original connection reflection · Five full guides free");
if (quiz.slug === "body-frame-observations") return (zh ? "原创轮廓观察 · 三篇全文免费" : "Original outline reflection · Three full guides free");
if (quiz.kind === "likert") return (zh ? "原创自我观察问卷 · 完整结果免费" : "Original self-reflection questionnaire · Full results free");
return (zh ? "自编风格问卷 · 完整结果免费" : "Original style questionnaire · Full results free");
})();
  const pageReferences = (() => {
if (gapEditorial) return [...(quiz.references ?? []), ...gapEditorial.references];
if (slug === "attraction-experiences") return [...(quiz.references ?? []), ...attractionLandingReferences];
if (slug === "dark-tetrad-sd4") return [...(quiz.references ?? []), ...sd4LandingReferences];
if (slug === "relationship-worry-habits") return [...(quiz.references ?? []), ...relationshipWorryLandingReferences];
if (slug === "face-self-image") return [...(quiz.references ?? []), ...faceSelfImageLandingReferences];
if (slug === "dating-outlook") return [...(quiz.references ?? []), ...datingOutlookLandingReferences];
if (slug === "relationship-habits") return [...(quiz.references ?? []), ...relationshipHabitsLandingReferences];
if (slug === "intimacy-values") return [...(quiz.references ?? []), ...intimacyValuesLandingReferences];
if (slug === "work-activity-interests") return [...(quiz.references ?? []), ...workActivityLandingReferences];
if (slug === "tipi-10") return [...(quiz.references ?? []), ...tipi10LandingReferences];
if (slug === "social-attitudes-reflection") return [...(quiz.references ?? []), ...socialAttitudesLandingReferences];
if (slug === "everyday-control-style") return [...(quiz.references ?? []), ...controlLandingReferences];
if (slug === "love-type-16") return [...(quiz.references ?? []), ...loveCombinationsLandingReferences];
if (slug === "energy-flow") return [...(quiz.references ?? []), ...energyRhythmLandingReferences];
if (slug === "mental-age") return [...(quiz.references ?? []), ...playfulAgeLandingReferences];
if (slug === "stupidity-test") return [...(quiz.references ?? []), ...everydayMixupsLandingReferences];
if (slug === "tech-savvy") return [...(quiz.references ?? []), ...techConfidenceLandingReferences];
if (slug === "orientation-exploration-test") return [...(quiz.references ?? []), ...orientationLandingReferences];
if (slug === "sake-type") return [...(quiz.references ?? []), ...sakeTypeLandingReferences];
if (slug === "stress-check-in-test") return [...(quiz.references ?? []), ...monthlyStressLandingReferences];
if (slug === "conflict-boundary-behaviors-test") return [...(quiz.references ?? []), ...conflictBoundaryLandingReferences];
if (slug === "four-axes-test") return [...(quiz.references ?? []), ...fourAxesLandingReferences];
if (slug === "seven-sins-virtues-test") return [...(quiz.references ?? []), ...virtuesLandingReferences];
if (slug === "stress-response-patterns-test") return [...(quiz.references ?? []), ...stressResponseLandingReferences];
if (slug === "remote-work") return [...(quiz.references ?? []), ...remoteWorkLandingReferences];
if (slug === "freelance-ready") return [...(quiz.references ?? []), ...freelanceReadyLandingReferences];
if (slug === "coping-rhythm-test") return [...(quiz.references ?? []), ...copingRhythmLandingReferences];
if (slug === "habit-patterns-test") return [...(quiz.references ?? []), ...habitPatternsLandingReferences];
if (slug === "intimacy-preference-test") return [...(quiz.references ?? []), ...intimacyLandingReferences];
if (slug === "breakup-reflection-test") return [...(quiz.references ?? []), ...breakupLandingReferences];
if (slug === "holding-yourself-back") return [...(quiz.references ?? []), ...holdingLandingReferences];
if (slug === "inner-critic-voice-test") return [...(quiz.references ?? []), ...fscrsLandingReferences];
if (slug === "parenting-style") return [...(quiz.references ?? []), ...parentingLandingReferences];
if (slug === "sensory-processing-test") return [...(quiz.references ?? []), ...spqLandingReferences];
if (slug === "competency-test") return [...(quiz.references ?? []), ...competencyLandingReferences];
if (slug === "hsp-sensitivity-quiz") return [...(quiz.references ?? []), ...hspLandingReferences];
if (slug === "executive-function") return [...(quiz.references ?? []), ...adexiLandingReferences];
if (slug === "capacity-to-love-test") return [...(quiz.references ?? []), ...ctlLandingReferences];
if (slug === "love-fight-style") return [...(quiz.references ?? []), ...lovefightLandingReferences];
if (slug === "annoying-person-test") return [...(quiz.references ?? []), ...annoyingLandingReferences];
if (slug === "sternberg-love") return [...(quiz.references ?? []), ...sternbergLandingReferences];
if (slug === "jealousy-scale") return [...(quiz.references ?? []), ...jealousyLandingReferences];
if (slug === "mote-type") return [...(quiz.references ?? []), ...moteLandingReferences];
if (slug === "apology-language") return [...(quiz.references ?? []), ...apologyLandingReferences];
if (slug === "perfectionism") return [...(quiz.references ?? []), ...sapsLandingReferences];
if (slug === "friendship-compatibility") return [...(quiz.references ?? []), ...friendshipFitLandingReferences];
if (slug === "toxic-positivity-test") return [...(quiz.references ?? []), ...positivePressureLandingReferences];
if (slug === "conflict-styles") return [...(quiz.references ?? []), ...conflictStylesLandingReferences];
if (slug === "communication-adaptability") return [...(quiz.references ?? []), ...communicationAdaptabilityLandingReferences];
if (slug === "self-compassion") return [...(quiz.references ?? []), ...scs26LandingReferences];
if (slug === "wholesome-partner") return [...(quiz.references ?? []), ...wholesomePartnerLandingReferences];
if (slug === "burnout-risk") return [...(quiz.references ?? []), ...cbiLandingReferences];
if (slug === "time-management") return [...(quiz.references ?? []), ...timeManagementLandingReferences];
if (slug === "self-esteem") return [...(quiz.references ?? []), ...selfEsteemLandingReferences];
if (slug === "morality-6") return [...(quiz.references ?? []), ...mfq2LandingReferences];
if (slug === "trust-issues-test") return [...(quiz.references ?? []), ...trustLandingReferences];
if (slug === "libertarian") return [...(quiz.references ?? []), ...libertyLandingReferences];
if (slug === "spatial-reasoning") return [...(quiz.references ?? []), ...spatialReasoningLandingReferences];
if (slug === "political-coordinates") return [...(quiz.references ?? []), ...politicalCoordinatesLandingReferences];
if (slug === "relationship-commitment") return [...(quiz.references ?? []), ...commitmentLandingReferences];
if (slug === "freudian-personality") return [...(quiz.references ?? []), ...freudianLandingReferences];
if (slug === "adult-age-preferences") return [...(quiz.references ?? []), ...adultAgePreferencesLandingReferences];
if (slug === "digital-ethics-citizenship") return [...(quiz.references ?? []), ...digitalCitizenshipLandingReferences];
if (slug === "numerical-reasoning") return [...(quiz.references ?? []), ...numericalReasoningLandingReferences];
if (slug === "abstract-reasoning") return [...(quiz.references ?? []), ...abstractReasoningLandingReferences];
if (slug === "relationship-preferences") return relationshipPreferencesLandingReferences;
if (slug === "hexaco") return [...(quiz.references ?? []), ...hexacoLandingReferences];
if (slug === "relationship-values") return relationshipValuesLandingReferences;
if (slug === "8-values-political") return [...(quiz.references ?? []), ...eightValuesLandingReferences];
if (slug === "situational-judgement") return [...(quiz.references ?? []), ...situationalJudgementLandingReferences];
if (slug === "love-personality") return lovePersonalityLandingReferences;
if (slug === "german-proficiency") return [...(quiz.references ?? []), ...germanLandingReferences];
if (slug === "customer-service-aptitude") return [...(quiz.references ?? []), ...customerServiceLandingReferences];
if (slug === "ai-literacy") return [...(quiz.references ?? []), ...aiLiteracyLandingReferences];
if (slug === "personal-finance-literacy") return [...(quiz.references ?? []), ...personalFinanceLandingReferences];
if (slug === "rizz-test") return rizzLandingReferences;
if (slug === "problem-solving-critical-thinking") return [...(quiz.references ?? []), ...problemSolvingLandingReferences];
if (slug === "color-season") return colorSeasonLandingReferences;
if (slug === "eras-of-you-test") return erasOfYouLandingReferences;
return (quiz.references ?? []);
})();
  const visibleReferences = pageReferences.filter(reference => {
    const host = new URL(reference.url).hostname.replace(/^www\./, "");
    return host !== "jobcannon.io" && host !== "idrlabs.com";
  });
  return (() => <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: (slug === "stress-check-in-test" ? monthlyStressLandingDescription[locale] : slug === "four-axes-test" ? fourAxesLandingDescription[locale] : quiz.description[locale]), locale })} />
    <ExploreTestIntro slug={slug} locale={locale}>

    <h1 className="mt-3 text-4xl font-semibold leading-tight">{slug === "work-activity-interests" && zh ? <><span className="inline-block">{quiz.title.zh.split("：")[0]}：</span><span className="inline-block">{quiz.title.zh.split("：").slice(1).join("：")}</span></> : slug === "parenting-style" && zh ? <>{quiz.title.zh.split("：")[0]}：<br />{quiz.title.zh.split("：").slice(1).join("：")}</> : quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{(slug === "stress-check-in-test" ? monthlyStressLandingDescription[locale] : slug === "four-axes-test" ? fourAxesLandingDescription[locale] : quiz.description[locale])}</p>
    <p className="explore-intro-meta"><span>{quiz.kind === "fscrs22" ? (zh ? "22 条陈述 · 按自己的节奏 · 无需注册" : "22 statements · Self-paced · No signup") : zh ? `${quiz.questions.length}题 · 约${quiz.minutes}分钟 · 无需注册` : `${quiz.questions.length} questions · about ${quiz.minutes} ${quiz.minutes === 1 ? "minute" : "minutes"} · no signup`}</span><span>{entryLabel}</span></p>

    <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    {quiz.kind === "fscrs22" && <QuestionnaireFscrs22Attribution quiz={quiz} locale={locale} />}
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-purpose"><h2 id="questionnaire-purpose" className="text-2xl font-semibold">{(() => {
if (slug === "attraction-experiences") return attractionLandingSections[0].title[locale];
if (slug === "dark-tetrad-sd4") return sd4LandingSections[0].title[locale];
if (slug === "work-traits-reflection") return workTraitsLandingSections[0].title[locale];
if (slug === "relationship-worry-habits") return relationshipWorryLandingSections[0].title[locale];
if (slug === "face-self-image") return faceSelfImageLandingSections[0].title[locale];
if (slug === "work-role-reflection") return workRoleLandingSections[0].title[locale];
if (slug === "dating-outlook") return datingOutlookLandingSections[0].title[locale];
if (slug === "relationship-habits") return relationshipHabitsLandingSections[0].title[locale];
if (slug === "intimacy-values") return intimacyValuesLandingSections[0].title[locale];
if (slug === "work-activity-interests") return workActivityLandingSections[0].title[locale];
if (slug === "tipi-10") return (zh ? "TIPI-10测什么：五个宽泛领域的两题概括" : "What TIPI-10 measures: five broad two-item domains");
if (slug === "social-attitudes-reflection") return (zh ? "社会态度反思：四个主题的认同与情境" : "Social attitudes: agreement and context across four topics");
if (slug === "interpersonal-preferences") return (zh ? "人际偏好反思：主动行为与期望回应" : "Interpersonal preferences: actions and wanted responses");
if (slug === "everyday-control-style") return (zh ? "日常掌控方式：六类共同计划行动" : "Everyday control: six shared-plan actions");
if (slug === "cyberpunk-edgerunners") return (zh ? "《边缘行者》角色测试：七个人物与本版联想" : "Cyberpunk: Edgerunners Test: seven characters and this edition’s angles");
if (slug === "love-type-16") return (zh ? "爱情类型测试：四组关系偏好与十六种组合" : "Love Type Test: four relationship preferences and sixteen combinations");
if (slug === "food-disgust") return (zh ? "食物厌恶测试：32道情境与八个领域" : "Food Disgust Test: 32 situations across eight domains");
if (slug === "energy-flow") return (zh ? "精力与专注节奏自评：时段、分段、条件与暂停" : "Energy & Flow Profile: timing, effort, conditions and pauses");
if (slug === "mental-age") return (zh ? "心理年龄测试：新鲜与熟悉的娱乐选择" : "Mental Age Test: playful choices about novelty and familiarity");
if (slug === "stupidity-test") return (zh ? "犯蠢测试：辨认六类日常乌龙" : "Stupidity Test: recognize six everyday mix-up themes");
if (slug === "tech-savvy") return (zh ? "技术素养自评：六种工具学习情境" : "Tech Savvy Test: six tool-learning situations");
if (slug === "orientation-exploration-test") return (zh ? "取向探索测试：五个主题的自我观察" : "Orientation Exploration Test: five topics for self-observation");
if (slug === "sake-type") return (zh ? "酒水类型测试：四种创意与相聚意象" : "Sake Type game: four creative and social images");
if (slug === "stress-check-in-test") return (zh ? "近一个月压力自评：四道原创题观察什么？" : "Monthly Stress Check-In: what the four original prompts explore");
if (slug === "conflict-boundary-behaviors-test") return (zh ? "冲突与边界行为测试：四组近期行动观察" : "Conflict and Boundary Behaviors Test: four groups of recent actions");
if (slug === "four-axes-test") return (zh ? "四轴测试探索什么？表达、思维、生活与公共政策偏好" : "Four Axes Test: expression, thinking, lifestyle and public-policy preferences");
if (slug === "seven-sins-virtues-test") return (zh ? "七宗罪与七美德测试：七类日常观察主题" : "Seven Sins and Virtues Test: seven everyday observation themes");
if (slug === "euphoria-character-quiz") return (zh ? "《亢奋》角色测试：八个人物视角与原创日常选择" : "Euphoria character quiz: eight fictional perspectives and original everyday choices");
if (slug === "stress-response-patterns-test") return (zh ? "压力反应观察测什么？五组近期行为描述" : "What does the Stress Response Patterns Test record? Five recent themes");
if (slug === "remote-work") return (zh ? "远程工作准备测什么？任务、条件与共同约定" : "What does remote readiness record? Tasks, conditions and agreements");
if (slug === "freelance-ready") return (zh ? "自由职业准备测什么？五组行动与具体项目" : "What does freelance readiness record? Five groups and one project");
if (slug === "coping-rhythm-test") return (zh ? "应对节奏测什么？四组日常先行选择" : "What does coping rhythm mean? Four everyday first moves");
if (slug === "habit-patterns-test") return (zh ? "习惯模式测什么？同一习惯的五个观察角度" : "What does the Habit Patterns Test record? Five perspectives");
if (slug === "intimacy-preference-test") return (zh ? "亲密偏好测什么？四类互动与作答条件" : "What does intimacy preference mean? Four areas and response conditions");
if (slug === "disc") return (zh ? "DISC测试测什么？四类行为风格与本站题本" : "What does DISC measure? The model and this questionnaire");
if (slug === "color-season") return (zh ? "色彩季节测试探索什么？可见配色与偏好范围" : "What does this Color Analysis Quiz explore? Visible palettes and preference scope");
if (slug === "problem-solving-critical-thinking") return (zh ? "问题解决与批判性思维练什么？三组情境任务" : "What does this test practise? Three groups of scenario tasks");
if (slug === "word-skills") return (zh ? "Word技能测试练什么？五类文档任务" : "What does this Word Skills Test practise? Five document topics");
if (slug === "project-management") return (zh ? "项目管理测试练什么？五类项目任务" : "What does this Project Management Test practise? Five project topics");
if (slug === "rizz-test") return (zh ? "Rizz测试观察什么？四类具体交流做法" : "What does this Rizz Test observe? Four conversation practices");
if (slug === "personal-finance-literacy") return (zh ? "个人理财素养测试练什么？三组知识与计算任务" : "What does this Financial Literacy Test practise? Three knowledge topics");
if (slug === "ai-literacy") return (zh ? "人工智能素养测试练什么？四组概念与情境判断" : "What does this AI Literacy Test practise? Four knowledge topics");
if (slug === "chinese-zodiac") return (zh ? "中国十二生肖测试探索什么？文化意象与原创故事角色" : "What does this Chinese Zodiac Quiz explore? Culture and original story roles");
if (slug === "customer-service-aptitude") return (zh ? "客户服务情景测试练什么？四组知识与处理判断" : "What does this Customer Service Test practise? Four decision topics");
if (slug === "german-proficiency") return (zh ? "德语水平测试练什么？四组书面语法与阅读任务" : "What does this German Test practise? Four written grammar and reading topics");
if (slug === "zodiac-sign-quiz") return (zh ? "星座测试探索什么？十二种原创故事视角" : "What does this Zodiac Sign Quiz explore? Twelve original story lenses");
if (slug === "love-personality") return (zh ? "恋爱人格测试探索什么？表达、回应、空间与修复" : "What does the Love Personality Test explore? Expression, response, space and repair");
if (slug === "situational-judgement") return (zh ? "情境判断测试练什么？五类职场条件判断" : "What does this Situational Judgement Test practise? Five workplace topics");
if (slug === "8-values-political") return (zh ? "8 Values测试探索什么？四轴与八个互补端点" : "What does the 8 Values Test explore? Four axes and eight poles");
if (slug === "relationship-values") return (zh ? "爱情阵营测试测什么？四类关系价值与情境选择" : "What does the Relationship Values Test explore? Four themes in context");
if (slug === "hexaco") return (zh ? "HEXACO人格测试测什么？六领域与240题版本" : "What does the HEXACO test measure? Six domains and this 240-item edition");
if (slug === "relationship-preferences") return (zh ? "恋爱安排偏好测什么？联系空间与确定弹性" : "What does this test explore? Contact, space, certainty and flexibility");
if (slug === "abstract-reasoning") return (zh ? "抽象推理测试练什么？四类符号规则任务" : "What does this abstract reasoning test cover? Four symbolic task formats");
if (slug === "conservatism") return (zh ? "保守主义测试测什么？SECS2013美国议题与两域读法" : "What does this conservatism test assess? SECS 2013 U.S. issues");
if (slug === "numerical-reasoning") return (zh ? "数值推理测试练什么？五类数值任务" : "What does this numerical reasoning test cover? Five numerical task areas");
if (slug === "digital-ethics-citizenship") return (zh ? "数字公民意识练习：五类在线情境与判断依据" : "Digital citizenship practice: five areas and the basis for decisions");
if (slug === "adult-age-preferences") return (zh ? "年上年下偏好：三种成年伴侣情境" : "Adult age preferences: three partner contexts");
if (slug === "toxic-positivity-test") return (zh ? "有毒积极心态测试：三类习惯与具体情境" : "Toxic Positivity Test: three habits in context");
if (slug === "friendship-compatibility") return (zh ? "友谊契合度测试：同一段友谊的五组互动观察" : "Friendship Compatibility Test: one friendship, five interaction readings");
if (slug === "perfectionism") return (zh ? "SAPS完美主义测试：个人标准与表现期待差距" : "SAPS Perfectionism Test: personal Standards and Discrepancy");
if (slug === "apology-language") return (zh ? "道歉语言测试：五组接收偏好" : "Apology Language Test: five receiving preferences");
if (slug === "mote-type") return (zh ? "魅力类型测试：四组互动选择测什么" : "Mote Type Test: four comparisons of interaction choices");
if (slug === "jealousy-scale") return (zh ? "嫉妒量表：原创三组反思分别看什么" : "Jealousy Scale: three topics in an original reflection");
if (slug === "sternberg-love") return (zh ? "斯特恩伯格爱的三角：三个成分与本站原创题本" : "Sternberg’s love triangle: three components and this original form");
if (slug === "annoying-person-test") return (zh ? "烦人性格测试：五类互动观察什么" : "Annoying Person Test: what the five areas cover");
if (slug === "love-fight-style") return (zh ? "爱情吵架风格测试：四类互动过程与本站题本" : "Love Fight Style Test: four interaction processes and this original form");
if (slug === "capacity-to-love-test") return (zh ? "爱的能力测试：六个来源领域与2018题本" : "Capacity to Love Test: six source domains and the 2018 edition");
if (slug === "executive-function") return (zh ? "执行功能与ADEXI成人自评：两个部分观察什么" : "Executive function and the ADEXI adult self-report");
if (slug === "hsp-sensitivity-quiz") return (zh ? "高敏感体验反思：四个主题观察什么" : "HSP sensitivity reflection: what these four topics cover");
if (slug === "competency-test") return (zh ? "职业胜任力反思：六类近期工作行为" : "Competency reflection: six areas of recent work behavior");
if (slug === "sensory-processing-test") return (zh ? "完整SPQ测什么？感觉知觉与本站版本" : "What does the full SPQ measure? Sensory perception and this edition");
if (slug === "parenting-style") return (zh ? "育儿风格测试回看什么？具体行为与养育框架" : "What does this parenting-style reflection describe? Actions and the framework");
if (slug === "inner-critic-voice-test") return (zh ? "内心批评家测试测什么？FSCRS三类挫折回应" : "What is the FSCRS Inner Critic Test? Three responses to setbacks");
if (slug === "holding-yourself-back") return (zh ? "自我设限测试观察什么？七类日常困难" : "What does the Holding Yourself Back Test explore? Seven everyday topics");
if (slug === "breakup-reflection-test") return (zh ? "分手复盘测试回顾什么？四类独立主题" : "What does the Breakup Reflection Test review? Four separate topics");
if (slug === "conflict-styles") return (zh ? "冲突风格测试：五类分歧处理行动" : "Conflict Style Test: five ways of handling disagreements");
if (slug === "communication-adaptability") return (zh ? "沟通适应性测试：30道情境中的具体判断" : "Communication Adaptability Test: 30 contextual decisions");
if (slug === "self-compassion") return (zh ? "自我慈悲测试：SCS26题与六个组成部分" : "Self-Compassion Test: SCS-26 and six components");
if (slug === "wholesome-partner") return (zh ? "健康伴侣相处测试：八组议题与本人行动" : "Wholesome Partner Test: eight topics, one person’s actions");
if (slug === "burnout-risk") return (zh ? "倦怠测试：CBI个人与工作相关耗竭" : "Burnout Test: CBI personal and work-related exhaustion");
if (slug === "time-management") return (zh ? "时间管理测试：四组自报习惯与实际用途" : "Time Management Test: four groups of reported habits");
if (slug === "self-esteem") return (zh ? "自尊测试：罗森伯格量表、总体自我评价与本版题表" : "Self-Esteem Test: Rosenberg scale, global regard and this edition");
if (slug === "morality-6") return (zh ? "道德基础测试：MFQ-2、六类关切与所选版本" : "Moral Foundations Test: MFQ-2, six concerns and the selected edition");
if (slug === "trust-issues-test") return (zh ? "信任问题测试：四组日常行为与原创题本" : "Trust Issues Test: four everyday actions and this original bank");
if (slug === "libertarian") return (zh ? "自由意志主义测试：四组政治原则与原创题本" : "Libertarian Test: four political-principle topics and the original bank");
if (slug === "spatial-reasoning") return (zh ? "空间推理测试：五类变换与参照系" : "Spatial Reasoning Test: five transformations and reference frames");
if (slug === "mechanical-reasoning") return (zh ? "机械推理测试：五类基础力学模型" : "Mechanical Reasoning Test: five elementary mechanics models");
if (slug === "political-coordinates") return (zh ? "政治坐标测试：两类公共政策取舍" : "Political Coordinates Test: two sets of public-policy choices");
if (slug === "relationship-commitment") return (zh ? "亲密关系承诺度测试：四部分关系自我观察" : "Relationship Commitment Test: four separate reflections");
if (slug === "freudian-personality") return (zh ? "弗洛伊德人格测试：八个近期行为主题" : "Freudian reflection: eight recent-action themes");
if (slug === "sql-test") return (zh ? "SQL测试练什么？四组查询与明确输入" : "What does this SQL Test practise? Four task groups and complete inputs");
if (slug === "sales-aptitude") return (zh ? "销售能力测试练什么？四组情境与算术任务" : "What does this Sales Aptitude Test practise? Four scenario and maths groups");
if (slug === "python-test") return (zh ? "Python测试练什么？四组脚本与明确运行条件" : "What does this Python Test practise? Four script groups and a declared environment");
if (slug === "javascript-test") return (zh ? "JavaScript测试练什么？四组代码与明确运行条件" : "What does this JavaScript Test practise? Four code groups and a declared environment");
if (slug === "logical-reasoning") return (zh ? "逻辑与演绎推理测试练什么？四类前提与结论任务" : "What does this Logical Reasoning Test practise? Four premise-to-conclusion tasks");
if (slug === "eras-of-you-test") return (zh ? "时代的你测试探索什么？六类四周行为观察" : "What does the Eras of You Test explore? Six four-week observations");
if (slug === "financial-accounting") return (zh ? "财务会计测试练什么？六类基础任务" : "What does this Financial Accounting Test practise? Six foundational tasks");
if (slug === "java-test") return (zh ? "Java测试练什么？24段程序与四组代码阅读" : "What does this Java Test practise? Twenty-four programs in four groups");
if (slug === "found-family-role-test") return (zh ? "找到家庭角色测试探索什么？六种自愿贡献" : "What does this Found Family Role Test explore? Six voluntary contributions");
if (slug === "excel-skills") return (zh ? "Excel技能测试练什么？四组公式与数据任务" : "What does this Excel Skills Test practise? Four formula and data task groups");
if (slug === "feminine-energy") return (zh ? "女性气质能量测试观察什么？四组日常表达" : "What does this Feminine Energy Test observe? Four everyday expression themes");
if (slug === "computer-literacy") return (zh ? "计算机素养测试练什么？四组日常电脑任务" : "What does this Computer Literacy Test cover? Four everyday task groups");
if (slug === "verbal-reasoning") return (zh ? "言语推理测试练什么？四类语言与证据任务" : "What does this Verbal Reasoning Test practise? Four language and evidence task groups");
if (slug === "big-fish-energy-test") return (zh ? "大鱼能量测试测什么？六种海洋意象与日常选择" : "What does the Big Fish Energy Test explore? Six ocean images and everyday choices");
if (slug === "barbie-character") return (zh ? "芭比角色测试测什么？六种创作参与方式" : "What does this Barbie Character Test explore? Six ways to join a creative activity");
if (slug === "apocalypse-survival-type-test") return (zh ? "启示录生存类型测试测什么？六种虚构故事偏好" : "What does this Apocalypse Survival Type Test explore? Six fictional story preferences");
if (slug === "spanish-proficiency") return (zh ? "西班牙语水平测试练什么？四类书面语言任务" : "What does this Spanish Proficiency Test practise? Four written task groups");
if (slug === "space-marine-chapter") return (zh ? "星际战士战团测试探索什么？六种模型爱好选择" : "What does this Space Marine Chapter Test explore? Six hobby choices");
if (slug === "hundred-acre-wood-friend-quiz") return (zh ? "小熊维尼角色测试探索什么？六种参与选择" : "What does this Winnie the Pooh Quiz explore? Six ways to participate");
if (slug === "grammar-test") return (zh ? "英语语法测试练什么？四类书面结构与明确条件" : "What does this English Grammar Test practise? Four written task groups");
if (slug === "anime-character-archetype-test") return (zh ? "动漫角色测试探索什么？六种原创叙事贡献" : "What does this Anime Character Quiz explore? Six original story contributions");
if (slug === "blue-lock") return (zh ? "蓝色监狱角色测试探索什么？七种桌面参与方式" : "What does this Blue Lock Quiz explore? Seven tabletop contributions");
if (slug === "villain-era-archetype-test") return (zh ? "反派时代原型测试探索什么？六种边界开场" : "What does this Villain Era Test explore? Six boundary openings");
if (slug === "english-proficiency") return (zh ? "英语水平测试练什么？四类书面任务与复习重点" : "What does this English Proficiency Test practise? Four written task groups");
if (slug === "gossip-girl") return (zh ? "绯闻女孩角色测试探索什么？六种创作回应" : "What does this Gossip Girl Test explore? Six creative responses");
if (slug === "amazing-digital-circus") return (zh ? "神奇数字马戏团角色测试探索什么？六种参与选择" : "What does this Amazing Digital Circus Test explore? Six participation choices");
if (slug === "game-of-thrones") return (zh ? "权力的游戏角色测试探索什么？六种创作回应" : "What does this Game of Thrones Character Test explore? Six creative responses");
if (slug === "decade-aesthetic-test") return (zh ? "十年美学测试探索什么？六组年代视觉线索" : "What does the Decade Aesthetic Test explore? Six groups of visual cues");
if (slug === "twilight-character") return (zh ? "《暮光之城》角色测试探索什么？七种雨天聚会贡献" : "What does this Twilight Character Test explore? Seven hobby-gathering contributions");
if (slug === "wednesday-addams-character") return (zh ? "《星期三》角色测试探索什么？六种创作参与方式" : "What does this Wednesday Character Test explore? Six creative contributions");
if (slug === "stranger-things") return (zh ? "《怪奇物语》角色测试探索什么？六种桌面故事参与角度" : "What does this Stranger Things Character Test explore? Six tabletop-story lenses");
if (slug === "avengers-character") return (zh ? "《复仇者联盟》角色测试探索什么？六种手作展台贡献" : "What does this Avengers Character Test explore? Six display contributions");
if (slug === "dexter") return (zh ? "《嗜血法医》角色测试探索什么？六种谜题社团贡献" : "What does this Dexter Character Test explore? Six puzzle-club contributions");
if (slug === "spelling-test") return (zh ? "英语拼写测试练什么？四类字形识别与英文语境" : "What does this English Spelling Test practise? Four spelling topics in context");
if (slug === "harry-potter-character") return (zh ? "《哈利·波特》角色测试探索什么？七种共同活动中的贡献" : "What does this Harry Potter Character Test explore? Seven contributions");
if (slug === "egen-teto") return (zh ? "Egen-Teto测试探索什么？相处中的开场顺序" : "What does this Egen-Teto Test explore? First moves in interactions");
if (slug === "jujutsu-kaisen-character") return (zh ? "《咒术回战》角色测试探索什么？六种日常选择" : "What does this Jujutsu Kaisen Character Test explore? Six everyday choices");
if (slug === "aptitude-test") return (zh ? "能力倾向与认知能力测试练什么？五类题型与解题操作" : "What does this Aptitude & Cognitive Ability Test practise? Five task types and operations");
if (slug === "gilmore-girls") return (zh ? "《吉尔莫女孩》角色测试探索什么？六种相聚参与方式" : "What does this Gilmore Girls Character Test explore? Six gathering participation lenses");
if (slug === "south-park") return (zh ? "《南方公园》角色测试探索什么？七种小组参与角度" : "What does this South Park Character Test explore? Seven group participation lenses");
if (slug === "workplace-technology") return (zh ? "职场技术与协作测试练什么？四类任务条件推理" : "What does this Workplace Technology Test practise? Four groups of task-based reasoning");
if (slug === "nana-character") return (zh ? "《NANA》角色测试探索什么？七种创作参与方式" : "What does this Nana Character Test explore? Seven creative participation lenses");
if (slug === "delulu-test") return (zh ? "Delulu测试探索什么？六种自知只是想象的叙事角度" : "What does this Delulu Test explore? Six knowingly imagined narrative lenses");
if (slug === "cybersecurity-awareness") return (zh ? "网络安全意识测试练什么？五类日常安全选择" : "What does this Cyber Security Test practise? Five everyday security topics");
if (slug === "wojak") return (zh ? "Wojak角色测试探索什么？六种日常表达角度" : "What does this Wojak Test explore? Six everyday expression lenses");
if (slug === "attention-to-detail") return (zh ? "细节注意力测试练什么？四类信息核对任务" : "What does this Attention to Detail Test practise? Four checking tasks");
if (quiz.kind === "practice") return (zh ? "这套练习覆盖什么？" : "What does this practice cover?");
if (slug === "my-little-pony-character-quiz") return (zh ? "小马宝莉角色测试探索什么？六种共同活动角度" : "What does this My Little Pony quiz explore? Six shared-activity angles");
if (slug === "my-hero-academia-character-quiz") return (zh ? "我的英雄学院角色测试探索什么？六种学习参与角度" : "What does this My Hero Academia quiz explore? Six learning and participation angles");
if (slug === "hazbin-hotel-character-quiz") return (zh ? "地狱客栈角色测试探索什么？六种日常参与角度" : "What does this Hazbin Hotel quiz explore? Six everyday participation angles");
if (slug === "ginny-and-georgia-character-quiz") return (zh ? "金妮与乔治娅角色测试探索什么？五种参与角度" : "What does this Ginny & Georgia quiz explore? Five participation angles");
if (slug === "next-life") return (zh ? "来世之路测试探索什么？六种日常侧重" : "What does the Next Life Quiz explore? Six everyday priorities");
if (slug === "dark-triad") return (zh ? "黑暗三角测试观察什么？三个原创主题" : "What does this Dark Triad Test observe? Three original themes");
if (slug === "moral-dilemma-test") return (zh ? "道德困境测试探索什么？五种伦理提问" : "What does this Moral Dilemma Test explore? Five ethical questions");
if (slug === "egogram") return (zh ? "自我状态图测试观察什么？五类互动做法" : "What does this Egogram Test observe? Five interaction practices");
if (slug === "social-intelligence-test") return (zh ? "社交智能测试测什么？IPIP四题与自我判断" : "What does this Social Intelligence Test measure? Four IPIP self-reports");
if (slug === "male-archetype-test") return (zh ? "男性原型测试探索什么？四种角色与具体做法" : "What does this Male Archetype Test explore? Four roles and specific practices");
if (slug === "ikigai") return (zh ? "Ikigai生之目的测试探索什么？四种提问视角" : "What does this Ikigai Test explore? Four lenses for asking questions");
if (slug === "grit-test") return (zh ? "毅力测试观察什么？目标延续与努力续接" : "What does this Grit Test explore? Goal continuity and returning to effort");
if (slug === "toxic-trait") return (zh ? "有毒特征测试观察什么？五类具体互动做法" : "What does this Toxic Trait Test explore? Five specific interaction practices");
if (slug === "intelligence-type-test") return (zh ? "智能类型测试探索什么？六种原创思考入口" : "What does this Intelligence Type Test explore? Six original thinking approaches");
if (slug === "locus-of-control") return (zh ? "控制点测试测什么？IPIP整体控制相关自述" : "What does this Locus of Control Test measure? Overall IPIP control-related self-description");
if (slug === "growth-mindset-fixed-mindset") return (zh ? "成长型思维测试测什么？同一技能的当前学习信念" : "What does this Growth Mindset Test review? Current beliefs about one skill");
if (slug === "maturity-test") return (zh ? "成熟度测试回看什么？近四周的四类日常行为" : "What does this maturity reflection review? Four everyday practices over four weeks");
if (slug === "arabic-personality-compass") return (zh ? "性格罗盘测试探索什么？四种日常起手方式" : "What does this personality compass explore? Four everyday starting approaches");
if (slug === "inkblot-personality-quiz") return (zh ? "墨迹人格测验探索什么？10张原创图与五种读法" : "What does this inkblot quiz explore? Ten original images and five readings");
if (slug === "philosopher-personality-test") return (zh ? "哲学家性格测试探索什么？九个原典阅读入口" : "What does this philosopher quiz explore? Nine primary-text reading paths");
if (slug === "inner-child-personality-test") return (zh ? "内在童年性格测试探索什么？当下六种玩法" : "What does this Inner Child Personality Test explore? Six approaches now");
if (slug === "light-triad-test") return (zh ? "光明三元素测试测什么？LTS与三个侧面" : "What does the Light Triad Test explore? LTS and three facets");
if (slug === "values") return (zh ? "Schwartz价值观测试探索什么？十类目标与本站题本" : "What does this Schwartz Values Test explore? Ten goals and this form");
if (slug === "optimism-pessimism") return (zh ? "乐观与悲观性测试测什么？IPIP十项与解释范围" : "What does this Optimism Test measure? Ten IPIP items and scope");
if (slug === "socionics") return (zh ? "Socionics测试探索什么？四象限与16类型" : "What does this Socionics Test explore? Quadras and sixteen types");
if (slug === "sdt-motivation") return (zh ? "SDT动机测试：三种需要与六项体验" : "SDT Motivation Test: three needs and six experiences");
if (slug === "type-ab") return (zh ? "A型/B型人格测试：四项行为与本版读法" : "Type A / Type B Test: four behaviours and this edition");
if (slug === "dungeons-dragons-class") return (zh ? "D&D职业测试：十二类奇幻玩法与本版范围" : "D&D Class Quiz: twelve fantasy-play themes and this edition");
if (slug === "hello-kitty") return (zh ? "Hello Kitty角色测试：七位三丽鸥朋友与日常选择" : "Hello Kitty Character Quiz: seven Sanrio friends and everyday choices");
if (slug === "star-wars-character") return (zh ? "星球大战角色测试：七种日常选择与人物视角" : "Star Wars Character Quiz: seven everyday approaches and character readings");
if (slug === "bleach") return (zh ? "BLEACH死神角色测试：七种日常选择与人物视角" : "BLEACH Character Quiz: seven everyday approaches and character readings");
if (slug === "death-note") return (zh ? "死亡笔记角色测试：八种日常选择与人物视角" : "Death Note Character Quiz: eight everyday approaches and character readings");
if (slug === "naruto-character") return (zh ? "火影忍者角色测试：七种日常行动与合作视角" : "Naruto Character Quiz: seven everyday action and cooperation perspectives");
if (slug === "disney-princess") return (zh ? "迪士尼公主测试：十三种日常选择的角色视角" : "Disney Princess Quiz: thirteen everyday character perspectives");
if (slug === "chiikawa") return (zh ? "吉伊卡哇角色测试：六种日常选择的阅读角度" : "Chiikawa Character Quiz: six everyday perspectives");
if (slug === "bojack-horseman-character-quiz") return (zh ? "马男波杰克角色测试：五种表达与合作视角" : "BoJack Horseman Character Quiz: five expression and collaboration lenses");
if (slug === "moon-phase") return (zh ? "月相测试探索什么？八种活动节奏意象" : "What does this moon phase test explore? Eight activity-pace images");
if (slug === "past-life") return (zh ? "前世测试探索什么？八种历史活动意象" : "What does this past life quiz explore? Eight historical activity images");
if (slug === "aura-color") return (zh ? "光环颜色测试：七种表达意象与本版范围" : "Aura Color Test: seven expression metaphors and quiz scope");
if (slug === "what-element-am-i") return (zh ? "四元素测试：四种意象与本版偏好主题" : "Four-Element Quiz: four metaphors and this edition\u2019s preference themes");
if (slug === "which-tarot-card-are-you") return (zh ? "你是哪张塔罗牌：22个象征主题与题本范围" : "Which Tarot Card Are You? 22 symbolic themes and quiz scope");
if (slug === "greek-god") return (zh ? "希腊神测试：六位人物与本版偏好主题" : "Greek God Quiz: six figures and this edition\u2019s preference themes");
if (slug === "hogwarts-house-quiz") return (zh ? "霍格沃茨分院测试：四学院与本版选择主题" : "Hogwarts House Quiz: four houses and this edition\u2019s choice themes");
if (slug === "tsundere-dere-type") return (zh ? "傲娇类型测试：文化概念与本版情境" : "Dere Type Quiz: cultural concepts and everyday scenarios");
if (slug === "character-strengths") return (zh ? "性格优势测试测什么？24项自评与IPIP-VIA-R题本" : "What does this test measure? 24 character strengths and the IPIP-VIA-R items");
if (slug === "learning-style") return (zh ? "学习风格测试测什么？四种形式的当前使用意愿" : "What does this learning style test explore? Current preferences for four formats");
if (slug === "procrastinator-type-test") return (zh ? "拖延者类型测试测什么？六类普通任务情境" : "What does this procrastination test explore? Six ordinary-task patterns");
if (slug === "likable-person-test") return (zh ? "讨人喜欢测试测什么？五种互动贡献线索" : "What does the Likable Person Test explore? Five interaction approaches");
if (slug === "difficult-person-test") return (zh ? "难相处人格测试测什么？七类互动行为" : "What does the Difficult Person Test explore? Seven interaction patterns");
if (slug === "people-pleaser") return (zh ? "讨好型人格测试测什么？PPS三部分与日常选择" : "What does the People Pleaser Test explore? Three PPS parts and everyday choices");
if (slug === "music-taste-test") return (zh ? "音乐品味测试测什么？八类声音的喜欢程度" : "What does this Music Taste Test explore? Liking for eight sound families");
if (slug === "aesthetic-core-test") return (zh ? "美学核心测试探索什么？文字描述与视觉偏好" : "What does this aesthetic quiz explore? Descriptions and visual preferences");
if (slug === "travel-personality-test") return (zh ? "旅行性格测试探索什么？六种偏好与实际安排" : "What does this Travel Personality Test explore? Six preferences in context");
if (slug === "humor-style-test") return (zh ? "幽默风格测试探索什么？六种表达与实际使用" : "What does this Humor Style Test explore? Six expressions in use");
if (slug === "leadership-style") return (zh ? "领导风格测试测什么？四类做法与团队情境" : "What does this Leadership Style Test explore? Four approaches in teams");
if (slug === "communication-style") return (zh ? "沟通风格测试测什么？四种回应与六类情境" : "What does this Communication Style Test explore? Four responses, six contexts");
if (slug === "attachment-styles") return (zh ? "依恋风格测试测什么？关系担心与亲近退缩" : "What does this Attachment Style Quiz explore? Worry and distance");
if (slug === "love-languages") return (zh ? "爱的语言测试探索什么？五种关心方式与两个角色" : "What does this Love Language Test explore? Five ways, two roles");
if (slug === "temperament") return (zh ? "气质测试测什么？古典名称与本站四类选择" : "What does this Temperament Test explore? Four styles of choice");
if (slug === "introvert-extrovert") return (zh ? "内向外向测试测什么？IPIP十项外向性" : "What does this test measure? Ten IPIP Extraversion items");
if (slug === "jungian-archetype") return (zh ? "荣格原型测试探索什么？现代十二原型动机" : "What does the Jungian Archetype Test explore?");
if (slug === "moral-alignment") return (zh ? "道德阵营测试是什么？两轴与九宫格" : "What is moral alignment? Two axes and a nine-cell grid");
if (slug === "response-color") return (zh ? "色彩性格测试测什么？四类日常回应方式" : "What does the Color Personality Test explore?");
return (zh ? "这份问卷探索什么？" : "What does this test explore?");
})()}</h2><p>{renderCopy((slug === "stress-check-in-test" ? monthlyStressLandingIntroduction[locale] : slug === "four-axes-test" ? fourAxesLandingIntroduction[locale] : quiz.introduction[locale]))}</p>{(slug === "disc" || slug === "response-color") && <div className="disc-direction-definitions">{quiz.guide.find(section => section.id === "not-a-fixed-identity")?.paragraphs.map((paragraph, index) => <p key={index}>{renderCopy(paragraph[locale])}</p>)}</div>}</section>
    {slug === "attraction-experiences" && <section className="my-6 space-y-4 leading-8">{attractionLandingSections[0].paragraphs.map((text, index) => <p key={index}>{renderCopy(text[locale])}</p>)}</section>}
    {slug === "dark-tetrad-sd4" && <section className="my-6 space-y-4 leading-8">{sd4LandingSections[0].paragraphs.map((text, index) => <p key={index}>{renderCopy(text[locale])}</p>)}<QuestionnaireSd4Attribution locale={locale} /></section>}
    {slug === "work-traits-reflection" && <section className="my-6 space-y-4 leading-8">{workTraitsLandingSections[0].paragraphs.map((text, index) => <p key={index}>{renderCopy(text[locale])}</p>)}<WorkTraitsContext locale={locale} /></section>}
    {slug === "relationship-worry-habits" && <section className="my-6 space-y-4 leading-8">{relationshipWorryLandingSections[0].paragraphs.map((text, index) => <p key={index}>{renderCopy(text[locale])}</p>)}</section>}
    {slug === "face-self-image" && <section className="my-6 space-y-4 leading-8">{faceSelfImageLandingSections[0].paragraphs.map((text, index) => <p key={index}>{renderCopy(text[locale])}</p>)}</section>}
    {slug === "work-role-reflection" && <section className="my-6 space-y-4 leading-8">{workRoleLandingSections[0].paragraphs.map((text, index) => <p key={index}>{renderCopy(text[locale])}</p>)}</section>}
    {slug === "dating-outlook" && <section className="my-6 space-y-4 leading-8">{datingOutlookLandingSections[0].paragraphs.map((text, index) => <p key={index}>{renderCopy(text[locale])}</p>)}</section>}
    {slug === "relationship-habits" && <section className="my-6 space-y-4 leading-8">{relationshipHabitsLandingSections[0].paragraphs.map((text, index) => <p key={index}>{renderCopy(text[locale])}</p>)}</section>}
    {slug === "intimacy-values" && <section className="my-6 space-y-4 leading-8">{intimacyValuesLandingSections[0].paragraphs.map((text, index) => <p key={index}>{renderCopy(text[locale])}</p>)}</section>}
    {slug === "work-activity-interests" && <><section className="my-6 space-y-4 leading-8">{workActivityLandingSections[0].paragraphs.map((text, index) => <p key={index}>{renderCopy(text[locale])}</p>)}</section><WorkActivityContext locale={locale} /></>}
    {quiz.kind === "ctl41" && <QuestionnaireCtl41Attribution locale={locale} />}
    {quiz.kind === "cbi" && <QuestionnaireCbiAttribution locale={locale} />}
    {quiz.slug === "morality-6" && <QuestionnaireMfq2Attribution locale={locale} />}
    {quiz.kind === "saps" && <QuestionnaireSapsAttribution locale={locale} />}
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-method"><h2 id="questionnaire-method" className="text-2xl font-semibold">{(() => {
if (slug === "cyberpunk-edgerunners") return (zh ? "二十一题计数：出现机会、最高并列与读法" : "Twenty-one choices: exposure, highest-count ties and interpretation");
if (slug === "love-type-16") return (zh ? "四轴计分：每轴八题、精确并列与完整组合" : "Four-axis scoring: eight pairs, exact ties and complete combinations");
if (slug === "food-disgust") return (zh ? "FDS计分：六点评分、不同题数与缺项处理" : "FDS scoring: six-point ratings, unequal parts and missing responses");
if (slug === "energy-flow") return (zh ? "四组独立均值：选项、覆盖与完整算例" : "Four separate means: response options, coverage and worked examples");
if (slug === "mental-age") return (zh ? "完整公式：逐题点数与37个可能数字" : "The full formula: item points and 37 possible outputs");
if (slug === "stupidity-test") return (zh ? "怎样计次？选项出现、原始次数与最高并列" : "How counts work: option exposure, raw choices and highest ties");
if (slug === "tech-savvy") return (zh ? "计分方法：等权均值、数字项数与未评分回答" : "Scoring: equal-weight mean, rated count and unscored responses");
if (slug === "orientation-exploration-test") return (zh ? "回答怎样整理？选项分布、不确定与明确跳过" : "How responses are organized: distributions, uncertainty and explicit skips");
if (slug === "sake-type") return (zh ? "16题如何计次？对应表、位置轮换与最高并列" : "How sixteen choices are counted: response key, rotating positions and highest ties");
if (slug === "stress-check-in-test") return (zh ? "0至16总分如何产生？逐题贡献与反向计分" : "How the 0\u201316 total is calculated: item contributions and reverse scoring");
if (slug === "conflict-boundary-behaviors-test") return (zh ? "24条如何计分？数字、跳过与每组最低资料量" : "How 24 statements are scored: numeric answers, skips and group eligibility");
if (slug === "four-axes-test") return (zh ? "四轴位置怎样计算？方向、原始和与中点" : "How the four positions are calculated: direction, sums and midpoint");
if (slug === "seven-sins-virtues-test") return (zh ? "28题如何计算十四项得分？" : "How 28 responses produce fourteen separate scores");
if (slug === "euphoria-character-quiz") return (zh ? "《亢奋》测试怎样计分？20个答案、八条路线与全部最高并列" : "How the Euphoria quiz works: twenty answers, eight counts and every leading tie");
if (slug === "stress-response-patterns-test") return (zh ? "20题怎样计算？符合程度、原始和与独立均值" : "How are 20 responses scored? Agreement, sums and separate means");
if (slug === "remote-work") return (zh ? "20项怎样计分？行动阶段与每组四项规则" : "How are 20 actions scored? Stages and four-item coverage");
if (slug === "freelance-ready") return (zh ? "20项怎样计分？四阶段、完整覆盖与不计分" : "How are 20 actions scored? Stages, coverage and not rated");
if (slug === "coping-rhythm-test") return (zh ? "24题怎样计数？四组独立记录与3:3并列" : "How are 24 choices counted? Four records and 3:3 ties");
if (slug === "habit-patterns-test") return (zh ? "20题怎样计分？每组至少三题与跳过规则" : "How are 20 statements scored? Minimum coverage and skips");
if (slug === "intimacy-preference-test") return (zh ? "24题怎样计分？原始和、均分与不计分" : "How are 24 statements scored? Sums, means and unscored answers");
if (slug === "disc") return (zh ? "24道题如何计分？原始次数与并列规则" : "How are 24 choices scored? Counts and tie rules");
if (slug === "color-season") return (zh ? "色彩季节测试怎样计数？16次选择与全部最高并列" : "How are palette choices counted? Sixteen selections and every highest tie");
if (slug === "problem-solving-critical-thinking") return (zh ? "30题怎样计分？总正确数与三组分项" : "How are thirty tasks scored? Total and three topic counts");
if (slug === "word-skills") return (zh ? "Word测试怎样计分？25题与五项正确数" : "How is this Word Test scored? Twenty-five tasks and five counts");
if (slug === "project-management") return (zh ? "项目管理测试怎样计分？30题与五项正确数" : "How is this Project Management Test scored? Thirty tasks and five counts");
if (slug === "rizz-test") return (zh ? "Rizz测试怎样计分？有效项与四组均分" : "How is this Rizz Test scored? Rated items and four means");
if (slug === "personal-finance-literacy") return (zh ? "个人理财测试怎样计分？23题与三组答对数" : "How is the Financial Literacy Test scored? Twenty-three items and three topic counts");
if (slug === "ai-literacy") return (zh ? "AI素养测试怎样计分？20题与四组答对数" : "How is this AI Literacy Test scored? Twenty items and four counts");
if (slug === "chinese-zodiac") return (zh ? "十二生肖测试怎样计数？12次选择与全部最高并列" : "How are twelve choices counted? Raw totals and every highest tie");
if (slug === "customer-service-aptitude") return (zh ? "客户服务测试怎样计分？24题与四项正确数" : "How is this Customer Service Test scored? Twenty-four items and four counts");
if (slug === "german-proficiency") return (zh ? "德语测试怎样计分？28题与四项正确数" : "How is this German Test scored? Twenty-eight items and four section counts");
if (slug === "zodiac-sign-quiz") return (zh ? "星座测试怎样计数？12次选择与全部最高并列" : "How is this Zodiac Sign Quiz scored? Twelve choices and every highest tie");
if (slug === "love-personality") return (zh ? "恋爱人格测试怎样计数？24次相对选择与并列" : "How is the Love Personality Test scored? Twenty-four relative choices and ties");
if (slug === "situational-judgement") return (zh ? "情境判断测试怎样计分？25题与五项正确数" : "How is this Situational Judgement Test scored? Twenty-five items and five counts");
if (slug === "8-values-political") return (zh ? "8 Values怎样计分？跨轴权重与互补百分数" : "How is 8 Values scored? Cross-axis weights and paired percentages");
if (slug === "relationship-values") return (zh ? "爱情阵营怎样计分？配对选择与全部最高并列" : "How are relationship values scored? Paired choices and every highest tie");
if (slug === "hexaco") return (zh ? "HEXACO怎样计分？反向键、完整回答与NA" : "How is HEXACO scored? Reverse keys, complete ratings and NA");
if (slug === "relationship-preferences") return (zh ? "恋爱安排偏好怎样计分？两组原始次数与6:6并列" : "How are preferences counted? Two comparisons and 6:6 ties");
if (slug === "abstract-reasoning") return (zh ? "抽象推理怎样计分？四组正确数与逐题核对" : "How is practice scored? Four section counts and item-level review");
if (slug === "conservatism") return (zh ? "SECS保守主义测试怎样计分？反向键、两组均分与NA" : "How is SECS scored? Reverse keys, separate means and NA");
if (slug === "numerical-reasoning") return (zh ? "数值推理怎样计分？五组正确数与逐题核对" : "How is numerical practice scored? Five counts and item-level review");
if (slug === "digital-ethics-citizenship") return (zh ? "30道情境怎样计分？五组正确数与完整解析" : "How are thirty scenarios scored? Five counts and full rationales");
if (slug === "adult-age-preferences") return (zh ? "18题怎样计数？原始次数与完整并列" : "How are eighteen choices counted? Raw counts and complete ties");
if (slug === "toxic-positivity-test") return (zh ? "三组均分怎样算？反向转换与完整作答" : "Three means: reverse scoring and complete responses");
if (slug === "friendship-compatibility") return (zh ? "五组均分怎样算？频率评分与完整作答" : "Five means: frequency ratings and complete responses");
if (slug === "perfectionism") return (zh ? "SAPS怎样计分？两组四题总和与均值" : "SAPS scoring: two four-item sums and means");
if (slug === "apology-language") return (zh ? "重视程度怎样计分？五组均分与缺答" : "Importance ratings, five means and missing answers");
if (slug === "mote-type") return (zh ? "每组六次怎样算？独立计数与保留并列" : "Count six choices within each pair and keep every tie");
if (slug === "jealousy-scale") return (zh ? "三个均分怎样算？频率、强度与缺少经历" : "Three means: frequency, intensity and missing experience");
if (slug === "sternberg-love") return (zh ? "三组均分怎样计算？完整度与缺答" : "How three component means are calculated");
if (slug === "annoying-person-test") return (zh ? "20项有效作答怎样计分？五组和与均值" : "Twenty valid answers: five separate sums and means");
if (slug === "love-fight-style") return (zh ? "四组频率均分怎样计算？机会与完整度" : "How four frequency means are calculated");
if (slug === "capacity-to-love-test") return (zh ? "CTL-I领域和与均值怎样计算？反向键与完整度" : "How CTL-I domain sums and means are calculated");
if (slug === "executive-function") return (zh ? "ADEXI怎样计分？原始和、均分与完整度" : "ADEXI scoring: raw sums, means and complete responses");
if (slug === "hsp-sensitivity-quiz") return (zh ? "24项原创题怎样计分？独立均分与完整度" : "Twenty-four original items: separate means and completeness");
if (slug === "competency-test") return (zh ? "36项工作行为怎样计分？六组独立均分" : "How the 36-item reflection is scored: six separate means");
if (slug === "sensory-processing-test") return (zh ? "SPQ怎样计分？92项、44项反向键与原始总分" : "SPQ scoring: 92 items, 44 reverse keys and one raw total");
if (slug === "parenting-style") return (zh ? "12项回答怎样计分？两项独立频率均分" : "How 12 responses become two independent frequency means");
if (slug === "inner-critic-voice-test") return (zh ? "FSCRS怎样计分？22条陈述与三个独立部分" : "How FSCRS is scored: 22 statements and three independent parts");
if (slug === "holding-yourself-back") return (zh ? "35题怎样计分？七项独立频率均分" : "How 35 responses become seven separate frequency means");
if (slug === "breakup-reflection-test") return (zh ? "24题怎样计分？四组独立回顾记录" : "How 24 answers become four separate records");
if (slug === "conflict-styles") return (zh ? "冲突风格怎样计分？五组独立频率均分" : "Conflict-style scoring: five separate frequency means");
if (slug === "communication-adaptability") return (zh ? "沟通情境怎样计分？五部分计数与完整解析" : "Scoring communication cases: five section counts");
if (slug === "self-compassion") return (zh ? "SCS怎样计分？六部分等权、反向与缺答" : "How SCS scores are calculated: six equal parts");
if (slug === "wholesome-partner") return (zh ? "八组相处行为怎样计分？反向、均分与缺少机会" : "How the eight separate relationship readings are calculated");
if (slug === "burnout-risk") return (zh ? "CBI怎样计分？选项格式、精力反向与有效题数" : "CBI scoring: formats, energy reversal and valid counts");
if (slug === "time-management") return (zh ? "时间管理怎样计分？每组六条、两条反向与独立均分" : "Time-management scoring: six responses per part, two reverse keys");
if (slug === "self-esteem") return (zh ? "罗森伯格自尊量表计分：十题、五条反向与0—30总分" : "Rosenberg scoring: ten items, five reverse keys and a 0–30 total");
if (slug === "morality-6") return (zh ? "MFQ-2怎样计分？36项正向题与六个均分" : "How is MFQ-2 scored? Thirty-six direct items and six means");
if (slug === "trust-issues-test") return (zh ? "信任问题测试怎样计分？六项有效评分与四组均分" : "How is this Trust Issues Test scored? Six valid ratings and four separate means");
if (slug === "libertarian") return (zh ? "自由原则反思怎样计分？四组反向键与缺答规则" : "How are principles scored? Four groups, reverse keys and missing responses");
if (slug === "spatial-reasoning") return (zh ? "空间推理怎样计分？五项正确数与逐题核对" : "How is spatial practice scored? Five counts and item review");
if (slug === "mechanical-reasoning") return (zh ? "机械推理怎样计分？总正确数与五项计数" : "How is mechanical practice scored? Total and five topic counts");
if (slug === "political-coordinates") return (zh ? "政治坐标怎样计分？18项、原始差值与边界" : "How are coordinates counted? Eighteen items, raw differences and boundaries");
if (slug === "relationship-commitment") return (zh ? "四项怎样计分？六条、反向键与NA" : "How are four parts scored? Six items, reverse keys and NA");
if (slug === "freudian-personality") return (zh ? "48条怎样计分？八组原始和、均分与NA" : "How are forty-eight prompts scored? Eight sums, means and NA");
if (slug === "sql-test") return (zh ? "SQL测试怎样计分？24题与四组正确数" : "How is this SQL Test scored? Twenty-four tasks and four counts");
if (slug === "sales-aptitude") return (zh ? "销售能力测试怎样计分？24题与四组正确数" : "How is this Sales Aptitude Test scored? Twenty-four tasks and four counts");
if (slug === "python-test") return (zh ? "Python测试怎样计分？24题与四组正确数" : "How is this Python Test scored? Twenty-four items and four counts");
if (slug === "javascript-test") return (zh ? "JavaScript测试怎样计分？24题与四组正确数" : "How is this JavaScript Test scored? Twenty-four items and four counts");
if (slug === "logical-reasoning") return (zh ? "逻辑推理测试怎样计分？24题与四组正确数" : "How is this Logical Reasoning Test scored? Twenty-four items and four counts");
if (slug === "eras-of-you-test") return (zh ? "时代的你测试怎样计分？六组分别计算有效均分" : "How is the Eras of You Test scored? Six separate rated means");
if (slug === "financial-accounting") return (zh ? "财务会计测试怎样计分？24题与六项正确数" : "How is this Financial Accounting Test scored? Twenty-four items and six counts");
if (slug === "java-test") return (zh ? "Java测试怎样计分？总正确数与四项复习线索" : "How is this Java Test scored? Total counts and four revision cues");
if (slug === "found-family-role-test") return (zh ? "找到家庭角色测试怎样计分？原始次数与最高并列" : "How is this Found Family Role Test scored? Raw counts and highest ties");
if (slug === "excel-skills") return (zh ? "Excel技能测试怎样计分？24题与四项正确数" : "How is this Excel Skills Test scored? Twenty-four items and four counts");
if (slug === "feminine-energy") return (zh ? "女性气质能量测试怎样计分？四组独立均分" : "How is this Feminine Energy Test scored? Four separate means");
if (slug === "computer-literacy") return (zh ? "计算机素养测试怎样计分？24题与四项正确数" : "How is this Computer Literacy Test scored? Twenty-four items and four counts");
if (slug === "verbal-reasoning") return (zh ? "言语推理测试怎样计分？总正确数与四项记录" : "How is this Verbal Reasoning Test scored? Total and four section counts");
if (slug === "big-fish-energy-test") return (zh ? "大鱼能量测试怎样计数？18次选择与全部最高并列" : "How is Big Fish Energy counted? Eighteen choices and every highest tie");
if (slug === "barbie-character") return (zh ? "芭比角色测试怎样计数？18次选择与最高并列" : "How is the Barbie Character Test counted? Eighteen choices and highest ties");
if (slug === "apocalypse-survival-type-test") return (zh ? "怎样计数？24次选择与全部最高并列" : "How are counts calculated? Twenty-four choices and all highest ties");
if (slug === "spanish-proficiency") return (zh ? "西班牙语测试怎样计分？四组正确数与逐题解析" : "How is Spanish practice scored? Four correct counts and worked answers");
if (slug === "space-marine-chapter") return (zh ? "战团测试怎样计数？18题与全部最高并列" : "How is the Chapter Test counted? Eighteen choices and every highest tie");
if (slug === "hundred-acre-wood-friend-quiz") return (zh ? "故事书朋友测验怎样计数？18题与全部最高并列" : "How is the Storybook Friends Quiz counted? Eighteen choices and every highest tie");
if (slug === "grammar-test") return (zh ? "英语语法测试怎样计分？24题与四项正确数" : "How is this English Grammar Test scored? Twenty-four items and four counts");
if (slug === "anime-character-archetype-test") return (zh ? "动漫角色原型测试怎样计数？18题与全部最高并列" : "How is this Anime Archetype Quiz counted? Eighteen choices and all highest ties");
if (slug === "blue-lock") return (zh ? "蓝色监狱测试怎样计数？21题与全部最高并列" : "How is this Blue Lock Quiz counted? Twenty-one choices and all highest ties");
if (slug === "villain-era-archetype-test") return (zh ? "反派时代测试怎样计数？18次选择与全部最高并列" : "How is this Villain Era Test counted? Eighteen choices and all highest ties");
if (slug === "english-proficiency") return (zh ? "英语测试怎样计分？四组正确数与逐题解析" : "How is this English Test scored? Section counts and worked answers");
if (slug === "gossip-girl") return (zh ? "绯闻女孩测试怎样计数？18题与所有最高并列" : "How is this Gossip Girl Test counted? Eighteen choices and all highest ties");
if (slug === "amazing-digital-circus") return (zh ? "神奇数字马戏团测试怎样计数？18题与所有最高并列" : "How is this Amazing Digital Circus Test counted? Eighteen choices and all highest ties");
if (slug === "game-of-thrones") return (zh ? "权力的游戏角色测试怎样计数？18题与所有最高并列" : "How is this Game of Thrones Character Test counted? Eighteen items and all highest ties");
if (slug === "decade-aesthetic-test") return (zh ? "十年美学测试怎样计数？18题与所有最高并列" : "How is the Decade Aesthetic Test counted? Eighteen choices and highest ties");
if (slug === "twilight-character") return (zh ? "暮光之城角色测试怎样计数？21题与所有最高并列" : "How is this Twilight Character Test counted? Twenty-one choices and highest ties");
if (slug === "wednesday-addams-character") return (zh ? "星期三角色测试怎样计数？18题与所有最高并列" : "How is this Wednesday Character Test counted? Eighteen choices and highest ties");
if (slug === "stranger-things") return (zh ? "怪奇物语角色测试怎样计数？18题与全部最高并列" : "How is this Stranger Things Character Test counted? Eighteen choices and highest ties");
if (slug === "avengers-character") return (zh ? "复仇者角色测试怎样计数？18题与全部最高并列" : "How is this Avengers Character Test counted? Eighteen choices and highest ties");
if (slug === "dexter") return (zh ? "Dexter角色测试怎样计数？24题与最高并列" : "How is this Dexter Character Test counted? Twenty-four choices and highest ties");
if (slug === "spelling-test") return (zh ? "英语拼写测试怎样计分？24题与四项正确数" : "How is this Spelling Test scored? Twenty-four items and four counts");
if (slug === "harry-potter-character") return (zh ? "《哈利·波特》角色测试怎样计分？21次选择与最高并列" : "How is this Harry Potter Character Test scored? Twenty-one choices and highest ties");
if (slug === "egen-teto") return (zh ? "Egen-Teto测试怎样计分？18次选择与9比9并列" : "How is this Egen-Teto Test scored? Eighteen choices and a nine-each tie");
if (slug === "jujutsu-kaisen-character") return (zh ? "《咒术回战》角色测试怎样计分？24次选择与最高并列" : "How is this Jujutsu Kaisen Character Test scored? Twenty-four choices and highest ties");
if (slug === "aptitude-test") return (zh ? "能力倾向练习怎样计分？30题与五项正确数" : "How is this aptitude practice scored? Thirty items and five correct counts");
if (slug === "gilmore-girls") return (zh ? "《吉尔莫女孩》角色测试怎样计分？18次选择与全部最高并列" : "How is this Gilmore Girls Character Test scored? Eighteen choices and every highest tie");
if (slug === "south-park") return (zh ? "《南方公园》角色测试怎样计分？21次选择与全部最高并列" : "How is this South Park Character Test scored? Twenty-one choices and every highest tie");
if (slug === "workplace-technology") return (zh ? "职场技术与协作测试怎样计分？16题与四项答对数" : "How is this Workplace Technology Test scored? Sixteen items and four subtotals");
if (slug === "nana-character") return (zh ? "《NANA》角色测试怎样计分？21次选择与全部最高并列" : "How is this Nana Character Test scored? Twenty-one choices and every highest tie");
if (slug === "delulu-test") return (zh ? "Delulu测试如何计分？18次选择与全部最高并列" : "How is this Delulu Test scored? Eighteen choices and every highest tie");
if (slug === "cybersecurity-awareness") return (zh ? "网络安全意识测试怎样计分？20题与五项答对数" : "How is this Cyber Security Test scored? Twenty items and five subtotals");
if (slug === "wojak") return (zh ? "Wojak测试如何计分？18次选择与全部最高并列" : "How is this Wojak Test scored? Eighteen choices and every highest tie");
if (slug === "attention-to-detail") return (zh ? "细节注意力练习怎样计分？24题与四项答对数" : "How is attention-to-detail practice scored? Twenty-four items and four subtotals");
if (slug === "my-little-pony-character-quiz") return (zh ? "MLP角色测试如何计分？18次选择与全部最高并列" : "How is this MLP character quiz scored? Eighteen selections and every highest tie");
if (slug === "my-hero-academia-character-quiz") return (zh ? "MHA角色测试如何计分？24次选择与最高并列" : "How is this MHA character quiz scored? Twenty-four selections and highest ties");
if (slug === "hazbin-hotel-character-quiz") return (zh ? "角色测试如何计分？18次选择与全部最高并列" : "How are character matches counted? Eighteen selections and every highest tie");
if (slug === "ginny-and-georgia-character-quiz") return (zh ? "角色测试如何计分？20次选择与最高并列" : "How are character matches counted? Twenty selections and highest ties");
if (slug === "next-life") return (zh ? "来世之路如何计分？18次选择与全部并列" : "How is the Next Life Quiz scored? Eighteen selections and all highest ties");
if (slug === "dark-triad") return (zh ? "黑暗三角测试如何计分？独立均分与缺答" : "How is this Dark Triad Test scored? Separate means and missing ratings");
if (slug === "moral-dilemma-test") return (zh ? "道德困境测试如何计数？菜单、省略与最高并列" : "How are choices counted? Menus, omissions and every highest tie");
if (slug === "egogram") return (zh ? "自我状态图如何计分？五组频率与缺答" : "How is this egogram scored? Five frequencies and missing ratings");
if (slug === "social-intelligence-test") return (zh ? "四题如何计分？反向题、原始总分与资料不足" : "How are four items scored? Reverse keys, raw totals and missing ratings");
if (slug === "male-archetype-test") return (zh ? "20道情境题如何计数？原始选择与所有最高并列" : "How are twenty scenarios counted? Raw choices and every highest tie");
if (slug === "ikigai") return (zh ? "16道情境题怎样计数？四项选择与全部最高并列" : "How are sixteen scenarios counted? Four choice counts and every highest tie");
if (slug === "grit-test") return (zh ? "16条频率题怎样计分？反向题、有效条数与独立均分" : "How are sixteen frequency items scored? Reversals, completeness and separate means");
if (slug === "toxic-trait") return (zh ? "20条自评怎样计分？五项独立均分与资料不足" : "How are twenty items scored? Five separate means and missing information");
if (slug === "intelligence-type-test") return (zh ? "18道情境怎样计数？六项曝光、实际选择与最高并列" : "How are eighteen scenarios counted? Exposure, choices and every highest tie");
if (slug === "locus-of-control") return (zh ? "控制点测试怎样计分？20条、十道反向题与原始总分" : "How is the Locus of Control Test scored? Twenty items, ten reversals and a raw total");
if (slug === "growth-mindset-fixed-mindset") return (zh ? "12题怎样计分？六道反向题、九条门槛与连续均分" : "How are twelve items scored? Six reversals, nine ratings and a continuous mean");
if (slug === "maturity-test") return (zh ? "24题怎样计分？独立均分、有效条数与资料不足" : "How are twenty-four items scored? Separate means, rated counts and missing information");
if (slug === "arabic-personality-compass") return (zh ? "36题怎样计分？四向最高、邻向与完整并列" : "How are thirty-six choices scored? Highest directions, neighbours and every tie");
if (slug === "inkblot-personality-quiz") return (zh ? "10道看图选择怎样计分？次数与全部最高并列" : "How are ten visual choices scored? Counts and every highest tie");
if (slug === "philosopher-personality-test") return (zh ? "18道思路选择怎样计分？原始次数与完整并列" : "How are eighteen choices scored? Raw counts and every highest tie");
if (slug === "inner-child-personality-test") return (zh ? "18题怎样计分？全部次数与最高并列" : "How are eighteen choices scored? All counts and highest ties");
if (slug === "light-triad-test") return (zh ? "12条LTS怎样计分？整体与侧面原始分数" : "How are twelve LTS items scored? Overall and facet raw scores");
if (slug === "values") return (zh ? "30题怎样计分？原始均分、整体基线与相对值" : "How are 30 items scored? Raw means, the overall baseline and relative values");
if (slug === "optimism-pessimism") return (zh ? "十项怎样计分？反向题、总分与资料不足" : "How are ten items scored? Reverse keys, totals and missing ratings");
if (slug === "socionics") return (zh ? "24题怎样计分？四组次数与全部并列" : "How are 24 choices scored? Four counts and every highest tie");
if (slug === "sdt-motivation") return (zh ? "24题如何计分？六项独立均分与资料不足" : "How are 24 items scored? Six separate means and missing information");
if (slug === "type-ab") return (zh ? "20题如何计分？反向题、NA与四项独立均分" : "How are 20 items scored? Reverse keys, NA and four separate means");
if (slug === "dungeons-dragons-class") return (zh ? "24题怎样计分？十二项次数与全部最高并列" : "How are 24 choices scored? Twelve counts and every highest tie");
if (slug === "hello-kitty") return (zh ? "21题怎样计分？七项次数与全部最高并列" : "How are 21 choices scored? Seven counts and every highest tie");
if (slug === "star-wars-character") return (zh ? "21道题怎样计分？七项次数与全部最高并列" : "How are 21 choices scored? Seven counts and every highest tie");
if (slug === "bleach") return (zh ? "21道题怎样计分？七项次数与全部最高并列" : "How are 21 choices scored? Seven counts and every highest tie");
if (slug === "death-note") return (zh ? "24道题怎样计分？八项次数与全部最高并列" : "How are 24 choices scored? Eight counts and every highest tie");
if (slug === "naruto-character") return (zh ? "21道题怎样计分？七项次数与全部最高并列" : "How are 21 choices scored? Seven counts and every highest tie");
if (slug === "disney-princess") return (zh ? "26道题怎样计分？十三项次数与最高并列" : "How are 26 choices scored? Thirteen counts and highest ties");
if (slug === "chiikawa") return (zh ? "18道题怎样计分？次数与全部最高并列" : "How are 18 choices scored? Counts and every highest tie");
if (slug === "bojack-horseman-character-quiz") return (zh ? "角色测试怎样计分？原始次数与全部并列" : "How does scoring work? Raw counts and all highest ties");
if (slug === "moon-phase") return (zh ? "月相测试怎样计分？原始次数与全部并列" : "How does scoring work? Raw counts and all highest ties");
if (slug === "past-life") return (zh ? "前世测试怎样计分？次数、并列与解释范围" : "How does scoring work? Counts, ties and interpretation");
if (slug === "aura-color") return (zh ? "光环颜色测试怎样计分与保留并列？" : "How are aura color choices counted and ties retained?");
if (slug === "what-element-am-i") return (zh ? "四元素测试怎样计分与保留并列？" : "How are four-element choices counted and ties retained?");
if (slug === "which-tarot-card-are-you") return (zh ? "塔罗牌测验怎样计分与保留并列？" : "How are tarot quiz choices counted and ties retained?");
if (slug === "greek-god") return (zh ? "希腊神测试怎样计分与保留并列？" : "How are Greek myth choices counted and ties retained?");
if (slug === "hogwarts-house-quiz") return (zh ? "霍格沃茨分院测试怎样计分与保留并列？" : "How are house choices counted and ties retained?");
if (slug === "tsundere-dere-type") return (zh ? "傲娇类型测试怎样计分与保留并列？" : "How are dere choices counted and ties retained?");
if (slug === "character-strengths") return (zh ? "怎样计分与阅读？24项合计、均分和缺答" : "Scoring and interpretation: 24 raw sums, means and nonresponse");
if (slug === "learning-style") return (zh ? "怎样计分与阅读？四项均分、NA与具体情境" : "Scoring and reading results: four means, NA and concrete situations");
if (slug === "procrastinator-type-test") return (zh ? "怎样计分？六项独立均分、反向题与缺答" : "How is it scored? Six means, reverse items and missing ratings");
if (slug === "likable-person-test") return (zh ? "怎样计分？20题、五项计数与全部并列" : "How is it scored? Twenty items, five counts and all leading ties");
if (slug === "difficult-person-test") return (zh ? "怎样计分？七项独立均分与反向题" : "How is it scored? Seven separate means and reverse items");
if (slug === "people-pleaser") return (zh ? "PPS怎样计分？三项均分、缺答与算例" : "How is PPS scored? Three means, missing ratings and examples");
if (slug === "music-taste-test") return (zh ? "音乐品味测试怎样计分？均分、有效题数与算例" : "How is music taste scored? Means, rated-item counts and examples");
if (slug === "aesthetic-core-test") return (zh ? "美学核心测试怎样计分？原始次数与最高并列" : "How is this aesthetic quiz scored? Raw counts and highest ties");
if (slug === "travel-personality-test") return (zh ? "旅行性格测试怎样计分？次数、并列与读法" : "How is this travel test scored? Counts, ties and interpretation");
if (slug === "humor-style-test") return (zh ? "幽默风格怎样计分？独立均分与缺答示例" : "How are humor expressions scored? Separate means and missing ratings");
if (slug === "leadership-style") return (zh ? "24题如何计分？原始计数、并列与解释范围" : "How are 24 scenarios scored? Raw counts, ties and interpretation");
if (slug === "communication-style") return (zh ? "24题怎样计分？四项均分、算例与缺答" : "How are 24 items scored? Four means, examples and missing responses");
if (slug === "attachment-styles") return (zh ? "24题怎样计分？两项连续均分与反向题" : "How are 24 items scored? Two continuous means and reverse keys");
if (slug === "love-languages") return (zh ? "50条自评如何计分？十项独立均分与缺答" : "How are 50 ratings scored? Ten independent means and missing responses");
if (slug === "temperament") return (zh ? "24题四选一如何计分？原始次数、并列与理论背景" : "How are 24 choices scored? Counts, ties and theoretical context");
if (slug === "introvert-extrovert") return (zh ? "十项自评如何计分？反向题、边界与缺失回答" : "How are ten ratings scored? Reverse keys, bands and missing responses");
if (slug === "jungian-archetype") return (zh ? "36道情境题如何计分？原始次数与并列" : "How are 36 scenarios scored? Raw counts and ties");
if (slug === "moral-alignment") return (zh ? "24题如何映射到阵营？计数、分区与算例" : "How do 24 choices map to an alignment? Counts, bands and examples");
if (quiz.kind === "work-role12") return (zh ? "参与情境怎样整理为记录？" : "How are task contexts recorded?");
if (quiz.kind === "mini-orientation") return (zh ? "回答怎样整理为记录？" : "How are responses organized into a record?");
if (quiz.kind === "skills-evidence") return (zh ? "任务状态怎样记录？" : "How are task states recorded?");
if (quiz.kind === "practice") return (zh ? "答案怎样核对？" : "How are answers checked?");
return (zh ? "计分怎样产生结果？" : "How do choices become a result?");
})()}</h2>{quiz.kind === "fds32" && <QuestionnaireFds32Attribution locale={locale} />}{resultGuide.filter(section => section.id === entryMethodSection || ((() => {
if ((quiz.kind === "love-type16" || quiz.kind === "work-role12")) return true;
if (quiz.kind === "mini-virtues") return ["virtues-scoring", "virtues-complete", "virtues-source"].includes(section.id);
if (quiz.slug === "euphoria-character-quiz") return ["euphoria-counts", "euphoria-routes", "euphoria-edition"].includes(section.id);
if (quiz.kind === "mini-friction") return ["friction-scoring", "friction-complete", "friction-source"].includes(section.id);
if (quiz.kind === "ctl41") return ["ctl-scoring", "ctl-complete", "ctl-edition"].includes(section.id);
if ((quiz.kind === "mini-orientation" || quiz.kind === "mini-conflict" || quiz.kind === "stress-reflection4" || quiz.kind === "pss4" || quiz.kind === "four-axes" || quiz.kind === "mini-shadow" || quiz.kind === "preparation-actions20" || quiz.kind === "mini-coping" || quiz.kind === "mini-habit" || quiz.kind === "mini-intimacy" || quiz.kind === "mini-breakup" || quiz.kind === "holding-back35" || quiz.kind === "fscrs22" || quiz.kind === "parenting-practices" || quiz.kind === "spq92" || quiz.kind === "adexi14" || quiz.kind === "ptq15")) return true;
if (quiz.kind === "interaction-pairs") return ["original", "counting", "complete"].includes(section.id);
if (quiz.kind === "skills-evidence") return ["scope", "states", "counts"].includes(section.id);
if (quiz.kind === "tipi10") return ["tipi-source", "tipi-scoring", "tipi-missing"];
if (quiz.kind === "saps") return ["saps-source", "saps-scoring", "saps-administration"].includes(section.id);
if (quiz.kind === "scs26") return ["scs-method", "scs-missing", "scs-boundary"].includes(section.id);
if (quiz.kind === "cbi") return ["source-scoring", "missing-and-context", "support-and-source"].includes(section.id);
return ["rosenberg-scoring", "rosenberg-reading", "rosenberg-source", "practice-scoring", "practice-reading", "practice-limits", "compass-counts", "compass-ties", "raw-wins-explanation", "ties-explanation", "low-direction-explanation", "facet-scoring", "facet-reading", "facet-comparison", "archetype-counts", "archetype-ties", "archetype-metaphor", "two-axes", "display-bands", "worked-examples", "meaning-limits", "optimism-scoring", "optimism-source", "extraversion-scoring", "extraversion-bands", "extraversion-reading", "affection-scoring", "affection-roles", "affection-reading", "attachment-context", "attachment-scoring", "attachment-reading"].includes(section.id);
})())).map(section => slug === "multiple-intelligences" ? section.paragraphs.map((paragraph, index) => <p key={`${section.id}-${index}`}>{renderCopy(paragraph[locale])}</p>) : slug === "disc" ? <div className="disc-method-part" key={section.id}><h3>{section.title[locale]}</h3>{section.paragraphs.map((paragraph, index) => <p key={index}>{renderCopy(paragraph[locale])}</p>)}</div> : (quiz.kind === "love-type16" || quiz.kind === "mini-orientation" || quiz.kind === "mini-conflict" || quiz.kind === "stress-reflection4" || quiz.kind === "pss4" || quiz.kind === "four-axes" || quiz.kind === "mini-shadow" || quiz.kind === "preparation-actions20" || quiz.kind === "mini-coping" || quiz.kind === "mini-habit" || quiz.kind === "mini-intimacy" || quiz.kind === "mini-breakup" || quiz.kind === "holding-back35" || quiz.kind === "fscrs22" || quiz.kind === "parenting-practices" || quiz.kind === "spq92" || quiz.kind === "adexi14" || quiz.kind === "ptq15") ? [<h3 key={`${section.id}-title`} className="font-semibold">{section.title[locale]}</h3>, ...section.paragraphs.map((paragraph, index) => <p key={`${section.id}-${index}`}>{paragraph[locale]}</p>)] : quiz.kind === "saps" ? <section className="space-y-2" key={section.id}><h3 className="font-semibold">{section.title[locale]}</h3>{section.paragraphs.map((paragraph, index) => <p key={index}>{renderCopy(paragraph[locale])}</p>)}</section> : <section key={section.id} className="questionnaire-method-part"><h3 className="font-semibold">{section.title[locale]}</h3>{section.paragraphs.map((paragraph, index) => <p key={index}>{renderCopy(paragraph[locale])}</p>)}</section>)}</section>
    <section className="my-8" aria-labelledby="questionnaire-results"><h2 id="questionnaire-results" className="text-2xl font-semibold">{(() => {
if (slug === "cyberpunk-edgerunners") return (zh ? "七篇角色完整指南：实例、对照与结果解释" : "Seven complete character guides: examples, contrasts and result explanations");
if (slug === "love-type-16") return (zh ? "十六篇爱情类型完整指南与相邻代码比较" : "Sixteen complete Love Type guides, with neighboring-code comparisons");
if (slug === "food-disgust") return (zh ? "八篇FDS完整指南：情境、实例与结果解释" : "Eight complete FDS guides: situations, examples and interpretation");
if (slug === "energy-flow") return (zh ? "四篇完整指南：近期精力与专注体验" : "Four complete guides to recent energy and focus experiences");
if (slug === "mental-age") return (zh ? "完整心理年龄读法：算例、情境与研究区别" : "The complete playful-age guide: examples, situations and research distinctions");
if (slug === "stupidity-test") return (zh ? "六篇完整乌龙指南：情境、反例与主题比较" : "Six complete mix-up guides: scenes, counterexamples and comparisons");
if (slug === "tech-savvy") return (zh ? "完整连续读法：算例、任务区别与可选观察" : "The complete continuous guide: arithmetic, task differences and optional observations");
if (slug === "orientation-exploration-test") return (zh ? "五篇完整指南：体验、模式、标签与隐私" : "Five complete guides: experiences, patterns, labels and privacy");
if (slug === "sake-type") return (zh ? "四篇完整意象指南：例子、比较与可选尝试" : "Four complete image guides: examples, comparisons and optional experiments");
if (slug === "stress-check-in-test") return (zh ? "一篇完整指南，理解全部分数与回答模式" : "One complete guide for every total and answer pattern");
if (slug === "conflict-boundary-behaviors-test") return (zh ? "四篇完整指南：分歧、边界、影响与修复" : "Four complete guides: disagreement, boundaries, impact and repair");
if (slug === "four-axes-test") return (zh ? "四篇完整指南，分别理解每条轴" : "Four complete guides, without a combined type");
if (slug === "seven-sins-virtues-test") return (zh ? "七篇完整指南：反应、回应与日常实例" : "Seven complete guides: reactions, responses and everyday examples");
if (slug === "euphoria-character-quiz") return (zh ? "《亢奋》八篇完整角色指南" : "Eight complete Euphoria character guides");
if (slug === "stress-response-patterns-test") return (zh ? "五篇完整指南：从行为细节回到具体情境" : "Five complete guides: from behavior details to actual context");
if (slug === "remote-work") return (zh ? "五篇完整指南：接入条件、交接协同与边界" : "Five complete guides: access, coordination and boundaries");
if (slug === "freelance-ready") return (zh ? "五篇完整指南：从服务说明到交付复盘" : "Five complete guides: from service definition to delivery review");
if (slug === "coping-rhythm-test") return (zh ? "四篇完整指南：每组两种方式，都可阅读" : "Four complete guides: both approaches in every pair");
if (slug === "habit-patterns-test") return (zh ? "五篇完整指南：从开始线索到日常安排" : "Five complete guides: from starting cues to daily arrangements");
if (slug === "intimacy-preference-test") return (zh ? "四篇完整指南：分享、靠近、时间与隐私" : "Four complete guides: sharing, closeness, time and privacy");
if (slug === "color-season") return (zh ? "四份完整配色指南：24种示例色与全部九节说明" : "Four complete palette guides: twenty-four colours and every nine-section explanation");
if (slug === "problem-solving-critical-thinking") return (zh ? "三篇完整复习指南：步骤、决策与复盘" : "Three complete revision guides: steps, decisions and review");
if (slug === "word-skills") return (zh ? "五份完整Word复习指南：格式、结构与协作" : "Five complete Word revision guides: formatting, structure and review");
if (slug === "project-management") return (zh ? "五篇完整项目管理复习指南" : "Five complete project management revision guides");
if (slug === "rizz-test") return (zh ? "四份完整Rizz指南：表达、回应、邀玩与邀约" : "Four full Rizz guides: expression, replies, play and invitations");
if (slug === "personal-finance-literacy") return (zh ? "三篇完整理财指南：预算、储蓄风险与工资福利" : "Three full finance guides: budgets, saving and risk, pay and benefits");
if (slug === "ai-literacy") return (zh ? "四篇完整AI素养指南：模型、工具、核查与判断" : "Four full AI literacy guides: models, tools, checking and judgement");
if (slug === "chinese-zodiac") return (zh ? "十二生肖完整结果指南：十二种故事角色与行动取舍" : "Twelve full animal portraits: story roles and action trade-offs");
if (slug === "customer-service-aptitude") return (zh ? "四份完整客服练习指南：澄清、规则、表达与跟进" : "Four full customer service guides: clarification, rules, messages and follow-through");
if (slug === "german-proficiency") return (zh ? "四份完整德语指南：冠词格、动词、句式与阅读" : "Four complete German guides: cases, verbs, sentence structure and reading");
if (slug === "zodiac-sign-quiz") return (zh ? "十二星座完整结果指南：叙事视角、例子与表达取舍" : "Twelve full zodiac story guides: lenses, examples and expressive trade-offs");
if (slug === "love-personality") return (zh ? "恋爱人格测试完整结果：四个方向与全部15种组合" : "Love Personality Test full guides: four entries and all fifteen leading sets");
if (slug === "situational-judgement") return (zh ? "五份完整情境判断指南：规则、行动与复习方法" : "Five complete situational judgement guides: rules, actions and revision");
if (slug === "8-values-political") return (zh ? "八篇完整8 Values指南：四轴逐端解读" : "Eight complete 8 Values guides: read both ends of each axis");
if (slug === "relationship-values") return (zh ? "爱情阵营完整结果：四方向与全部15种组合" : "Complete relationship-values guides: four themes and all fifteen patterns");
if (slug === "hexaco") return (zh ? "HEXACO六领域结果：六篇完整公开指南" : "HEXACO domain results: six complete public guides");
if (slug === "relationship-preferences") return (zh ? "恋爱安排偏好完整结果：四篇单侧与两篇并列指南" : "Complete arrangement-preference results: four pole and two tie guides");
if (slug === "abstract-reasoning") return (zh ? "抽象推理完整复习指南：序列、类比、分类与变换" : "Complete abstract reasoning guides: sequences, analogies, classification and transformations");
if (slug === "conservatism") return (zh ? "SECS完整结果指南：社会与经济两个领域" : "Complete SECS guides: social and economic domains");
if (slug === "numerical-reasoning") return (zh ? "数值推理完整复习指南：运算、百分比、比例、数据与速率" : "Complete numerical reasoning guides: arithmetic, percentages, ratios, data and rates");
if (slug === "digital-ethics-citizenship") return (zh ? "五份完整复习指南：隐私、安全、信息、沟通与访问" : "Five complete revision guides: privacy, security, information, communication and access");
if (slug === "adult-age-preferences") return (zh ? "七种完整结果：三项情境与所有最高并列" : "Seven complete outcomes: three contexts and all joint maxima");
if (slug === "toxic-positivity-test") return (zh ? "三份积极压力完整指南" : "Three complete guides to positive pressure");
if (slug === "friendship-compatibility") return (zh ? "五份友谊互动完整指南" : "Five complete friendship interaction guides");
if (slug === "perfectionism") return (zh ? "两份SAPS完整指南：标准与差距分别读" : "Two complete SAPS reading guides");
if (slug === "apology-language") return (zh ? "五份道歉接收偏好完整指南" : "Five complete apology receiving-preference guides");
if (slug === "mote-type") return (zh ? "四篇互动选择完整指南：两端与并列" : "Four full interaction-choice guides: both sides and ties");
if (slug === "jealousy-scale") return (zh ? "三篇嫉妒反思完整指南" : "Three complete jealousy reflection guides");
if (slug === "sternberg-love") return (zh ? "爱的三角：三份完整阅读指南" : "Three complete love-triangle reading guides");
if (slug === "annoying-person-test") return (zh ? "五份互动反思完整指南" : "Five complete interaction reflection guides");
if (slug === "love-fight-style") return (zh ? "四类冲突过程完整阅读指南" : "Four complete conflict-process reading guides");
if (slug === "capacity-to-love-test") return (zh ? "CTL-I六领域完整阅读指南" : "Six complete CTL-I domain reading guides");
if (slug === "executive-function") return (zh ? "三篇ADEXI结果完整阅读指南" : "Three complete ADEXI result-reading guides");
if (slug === "hsp-sensitivity-quiz") return (zh ? "四份高敏感体验完整阅读指南" : "Four complete sensitivity-experience reading guides");
if (slug === "competency-test") return (zh ? "六份工作行为完整阅读指南" : "Six complete work-behavior reading guides");
if (slug === "sensory-processing-test") return (zh ? "SPQ分数完整阅读指南" : "Complete SPQ score reading guide");
if (slug === "parenting-style") return (zh ? "四种养育风格完整指南：概念与日常例子" : "Four complete parenting-style guides: concepts and everyday examples");
if (slug === "inner-critic-voice-test") return (zh ? "FSCRS三篇完整指南：含义、情境与读法" : "Three complete FSCRS guides: meaning, examples and interpretation");
if (slug === "holding-yourself-back") return (zh ? "七篇完整指南：日常例子与主题区别" : "Seven complete guides: everyday examples and practical distinctions");
if (slug === "breakup-reflection-test") return (zh ? "四篇完整指南：沟通、需要、边界与现实情境" : "Four complete guides: conversations, needs, boundaries and circumstances");
if (slug === "conflict-styles") return (zh ? "五份冲突处理完整指南：行动、情境与取舍" : "Five complete conflict-handling guides");
if (slug === "communication-adaptability") return (zh ? "五份沟通复习指南：从题内判断到实际尝试" : "Five complete communication revision guides");
if (slug === "self-compassion") return (zh ? "七份SCS完整指南：整体与六个部分" : "Seven complete SCS guides: overall and six components");
if (slug === "wholesome-partner") return (zh ? "八份伴侣相处完整指南" : "Eight complete partner-interaction guides");
if (slug === "burnout-risk") return (zh ? "两份CBI完整指南：16节全部可读" : "Two complete CBI guides: all sixteen sections");
if (slug === "time-management") return (zh ? "四份时间管理完整指南：24节全部可读" : "Four complete time-management guides: all twenty-four sections");
if (slug === "self-esteem") return (zh ? "罗森伯格分数完整指南：七节全部可读" : "One complete Rosenberg score guide: all seven sections");
if (slug === "morality-6") return (zh ? "六份MFQ-2完整指南：48节分别解读" : "Six complete MFQ-2 guides: all forty-eight sections explained");
if (slug === "trust-issues-test") return (zh ? "信任问题测试结果：四组独立读法与32节完整指南" : "Trust Issues Test results: four separate readings and thirty-two guide sections");
if (slug === "libertarian") return (zh ? "自由原则反思结果：四组独立读法与32节指南" : "Principles Reflection results: four separate readings and thirty-two guide sections");
if (slug === "spatial-reasoning") return (zh ? "五份完整空间推理指南：旋转、镜像、折纸、立方体与布局" : "Five complete spatial guides: rotations, reflections, folds, cubes and layouts");
if (slug === "mechanical-reasoning") return (zh ? "五份完整机械推理指南：原理、算例与复习" : "Five complete mechanics guides: principles, examples and revision");
if (slug === "political-coordinates") return (zh ? "四份完整指南：经济与社会方案的不同组合" : "Four complete guides: economic and civic proposal combinations");
if (slug === "relationship-commitment") return (zh ? "四份完整结果：意愿、体验、选择与关联投入" : "Four complete guides: intention, experience, options and investment");
if (slug === "freudian-personality") return (zh ? "八份完整指南：行为、情境与历史词汇" : "Eight complete guides: actions, context and historical vocabulary");
if (slug === "sql-test") return (zh ? "SQL完整复习指南：筛选、联接、聚合与窗口约束" : "Complete SQL revision guides: filters, joins, aggregates, windows and constraints");
if (slug === "sales-aptitude") return (zh ? "销售练习完整指南：需求、匹配、跟进与计算" : "Complete sales practice guides: discovery, fit, follow-up and maths");
if (slug === "python-test") return (zh ? "Python完整复习指南：四组主题与全部代码解析" : "Complete Python revision: four topics and every worked script");
if (slug === "javascript-test") return (zh ? "JavaScript完整复习指南：四组主题与全部代码解析" : "Complete JavaScript revision: four topics and every worked program");
if (slug === "logical-reasoning") return (zh ? "逻辑推理完整复习指南：四类任务与全部解析" : "Complete logical reasoning revision: four task groups and every explanation");
if (slug === "eras-of-you-test") return (zh ? "六类当前章节：完整指南与具体场景" : "Six current-chapter themes: complete guides and scenes");
if (slug === "financial-accounting") return (zh ? "财务会计完整复习指南：六类主题与全部解析" : "Complete financial accounting revision: six topics and every explanation");
if (slug === "java-test") return (zh ? "Java完整复习指南：表达式、控制流、对象与集合" : "Complete Java revision guides: expressions, control flow, objects and collections");
if (slug === "found-family-role-test") return (zh ? "六种朋友圈贡献：完整角色指南" : "Six friend-group contributions: complete role guides");
if (slug === "excel-skills") return (zh ? "Excel完整复习指南：公式、查找、数据与汇总" : "Complete Excel revision guides: formulas, lookup, data and summaries");
if (slug === "feminine-energy") return (zh ? "四组表达完整指南：行为、例子与情境" : "Complete guides to four expression themes: actions, examples and context");
if (slug === "computer-literacy") return (zh ? "计算机素养完整复习指南：文件、浏览器、邮件与Office" : "Complete computer literacy guides: files, browsers, email and Office");
if (slug === "verbal-reasoning") return (zh ? "言语推理完整指南：词义、类比、阅读与演绎" : "Complete verbal reasoning guides: meanings, analogies, reading and deduction");
if (slug === "big-fish-energy-test") return (zh ? "六种海洋意象：全部九节完整结果指南" : "Six ocean images: every complete nine-section result guide");
if (slug === "barbie-character") return (zh ? "六名芭比电影角色：全部完整结果指南" : "Six Barbie film characters: every complete result guide");
if (slug === "apocalypse-survival-type-test") return (zh ? "六种虚构营地角色：完整九节指南" : "Six fictional camp roles: complete nine-section guides");
if (slug === "spanish-proficiency") return (zh ? "西班牙语测试结果：四份完整公开复习指南" : "Spanish Practice Results: Four Complete Public Revision Guides");
if (slug === "space-marine-chapter") return (zh ? "星际战士战团测试结果：六份完整公开指南" : "Space Marine Chapter Results: Six Complete Public Guides");
if (slug === "hundred-acre-wood-friend-quiz") return (zh ? "小熊维尼角色测试结果：六份完整公开指南" : "Winnie the Pooh Character Results: Six Complete Public Guides");
if (slug === "grammar-test") return (zh ? "英语语法测试结果：四份完整复习指南" : "English Grammar Test Results: Four Complete Revision Guides");
if (slug === "anime-character-archetype-test") return (zh ? "动漫角色测试结果：六份完整公开故事指南" : "Anime Story Role Results: Six Complete Public Guides");
if (slug === "blue-lock") return (zh ? "蓝色监狱测试结果：七份完整公开指南" : "Blue Lock Quiz Results: Seven Complete Public Guides");
if (slug === "villain-era-archetype-test") return (zh ? "反派时代测试结果：六份九节完整指南" : "Villain Era Test Results: Six Complete Nine-Section Guides");
if (slug === "english-proficiency") return (zh ? "英语练习结果：四份完整复习指南" : "English Practice Results: Four Complete Revision Guides");
if (slug === "gossip-girl") return (zh ? "绯闻女孩测试结果：六份完整公开指南" : "Gossip Girl Test Results: Six Complete Public Guides");
if (slug === "amazing-digital-circus") return (zh ? "神奇数字马戏团测试结果：六份完整公开指南" : "Amazing Digital Circus Test Results: Six Complete Public Guides");
if (slug === "game-of-thrones") return (zh ? "权力的游戏角色测试结果：六份完整公开指南" : "Game of Thrones Character Test Results: Six Complete Public Guides");
if (slug === "decade-aesthetic-test") return (zh ? "十年美学测试结果：六份完整公开风格指南" : "Decade Aesthetic Test Results: Six Complete Public Style Guides");
if (slug === "twilight-character") return (zh ? "暮光之城角色测试结果：七份完整公开指南" : "Twilight Character Test Results: Seven Complete Public Guides");
if (slug === "wednesday-addams-character") return (zh ? "星期三角色测试结果：六份完整公开指南" : "Wednesday Character Test Results: Six Complete Public Guides");
if (slug === "stranger-things") return (zh ? "怪奇物语角色测试结果：六份完整公开指南" : "Stranger Things Character Test Results: Six Complete Public Guides");
if (slug === "avengers-character") return (zh ? "复仇者角色测试结果：六份完整公开指南" : "Avengers Character Test Results: Six Complete Public Guides");
if (slug === "dexter") return (zh ? "Dexter角色测试结果：六份完整公开指南" : "Dexter Character Test Results: Six Complete Public Guides");
if (slug === "spelling-test") return (zh ? "英语拼写复习指南：四类易错特点与完整解释" : "English Spelling Revision Guides: Four topics and full explanations");
if (slug === "harry-potter-character") return (zh ? "《哈利·波特》角色测试结果：七位人物的七节完整指南" : "Harry Potter Character Test results: seven full seven-section guides");
if (slug === "egen-teto") return (zh ? "Egen-Teto测试结果：两方向与并列九节完整指南" : "Egen-Teto Test results: two directions and a full nine-section tie guide");
if (slug === "jujutsu-kaisen-character") return (zh ? "《咒术回战》角色测试结果：六位人物的七节完整指南" : "Jujutsu Kaisen Character Test results: six full seven-section guides");
if (slug === "aptitude-test") return (zh ? "能力倾向练习结果：五份完整复习指南与30题解析" : "Aptitude practice results: five full revision guides and thirty explanations");
if (slug === "gilmore-girls") return (zh ? "《吉尔莫女孩》角色测试结果：六位人物的七节完整指南" : "Gilmore Girls Character Test results: six complete seven-section guides");
if (slug === "south-park") return (zh ? "《南方公园》角色测试结果：七位人物的七节完整指南" : "South Park Character Test results: seven complete seven-section guides");
if (slug === "workplace-technology") return (zh ? "职场技术复习指南：四个主题、二十节完整说明" : "Workplace technology revision guides: four topics and twenty complete sections");
if (slug === "nana-character") return (zh ? "《NANA》角色测试结果：七位人物的七节完整指南" : "Nana Character Test results: seven characters with complete seven-section guides");
if (slug === "delulu-test") return (zh ? "Delulu测试结果：六份九节完整指南" : "Delulu Test results: six complete nine-section guides");
if (slug === "cybersecurity-awareness") return (zh ? "网络安全复习指南：五个主题、二十五节完整说明" : "Cyber security revision guides: five topics and twenty-five complete sections");
if (slug === "wojak") return (zh ? "Wojak测试结果：六种表达角度的七节完整指南" : "Wojak Test results: six complete seven-section expression guides");
if (slug === "attention-to-detail") return (zh ? "细节注意力复习指南：四个主题、二十节完整说明" : "Attention-to-detail revision guides: four topics and twenty complete sections");
if (slug === "my-little-pony-character-quiz") return (zh ? "小马宝莉测试结果：六位小马的七节完整指南" : "My Little Pony quiz results: six complete seven-section pony guides");
if (slug === "my-hero-academia-character-quiz") return (zh ? "我的英雄学院测试结果：六位角色的七节完整指南" : "My Hero Academia quiz results: six complete seven-section character guides");
if (slug === "hazbin-hotel-character-quiz") return (zh ? "地狱客栈测试结果：六位角色的七节完整指南" : "Hazbin Hotel quiz results: six complete seven-section character guides");
if (slug === "ginny-and-georgia-character-quiz") return (zh ? "金妮与乔治娅测试结果：五位角色的八节完整指南" : "Ginny & Georgia quiz results: five full eight-section character guides");
if (slug === "next-life") return (zh ? "来世之路测试结果：六条路径与完整指南" : "Next Life Quiz results: six imagined paths and full guides");
if (slug === "dark-triad") return (zh ? "黑暗三角测试结果：三份完整九节指南" : "Dark Triad Test results: three complete nine-section guides");
if (slug === "moral-dilemma-test") return (zh ? "道德困境测试结果：五份完整伦理提问指南" : "Moral Dilemma Test results: five complete ethical-inquiry guides");
if (slug === "egogram") return (zh ? "自我状态图结果：五份完整九节指南" : "Egogram results: five complete nine-section guides");
if (slug === "social-intelligence-test") return (zh ? "社交智能测试结果：完整连续读法与九节指南" : "Social Intelligence Test results — Read the full continuum in the nine-section guide");
if (slug === "male-archetype-test") return (zh ? "男性原型测试结果：四份完整角色指南" : "Male Archetype Test results: four complete role guides");
if (slug === "ikigai") return (zh ? "Ikigai测试结果：四份完整探索指南" : "Ikigai Test results: four complete exploration guides");
if (slug === "grit-test") return (zh ? "毅力测试结果：两部分完整长期目标指南" : "Grit Test results: two complete long-term goal guides");
if (slug === "toxic-trait") return (zh ? "有毒特征测试结果：五部分完整互动指南" : "Toxic Trait Test results: five complete interaction guides");
if (slug === "intelligence-type-test") return (zh ? "智能类型测试结果：六份完整思考入口指南" : "Intelligence Type Test results: six complete thinking-approach guides");
if (slug === "locus-of-control") return (zh ? "控制点测试结果：完整连续读法" : "Locus of Control Test results: the complete continuous reading");
if (slug === "growth-mindset-fixed-mindset") return (zh ? "成长型思维测试结果：完整连续读法" : "Growth Mindset Test results: the complete continuous reading");
if (slug === "maturity-test") return (zh ? "成熟度测试结果：四部分完整阅读指南" : "Maturity reflection results: four complete reading guides");
if (slug === "arabic-personality-compass") return (zh ? "性格罗盘测试结果：四向与八种有序读法" : "Personality compass results: four base and eight ordered readings");
if (slug === "inkblot-personality-quiz") return (zh ? "五种墨迹读法结果：全部完整指南" : "Five inkblot reading results: all complete guides");
if (slug === "philosopher-personality-test") return (zh ? "九位哲学家结果：全部完整阅读指南" : "Nine philosopher results: all complete reading guides");
if (slug === "inner-child-personality-test") return (zh ? "六种童心玩法结果：全部完整指南" : "Six playful results: all complete guides");
if (slug === "light-triad-test") return (zh ? "三个侧面结果：全部完整阅读指南" : "Three facet results: all complete reading guides");
if (slug === "values") return (zh ? "十类价值观结果：全部完整阅读指南" : "Ten value results: all complete reading guides");
if (slug === "optimism-pessimism") return (zh ? "乐观自评结果：五份完整阅读指南" : "Optimism results: five complete reading guides");
if (slug === "socionics") return (zh ? "四象限结果：四份完整阅读指南" : "Four quadra results: all complete reading guides");
if (slug === "sdt-motivation") return (zh ? "六项需要体验结果：全部完整指南" : "Six need-experience results: all complete guides");
if (slug === "type-ab") return (zh ? "四项行为结果：全部完整阅读指南" : "Four behaviour results: all complete reading guides");
if (slug === "dungeons-dragons-class") return (zh ? "十二类D&D职业结果：全部完整指南" : "Twelve D&D class results: all complete guides");
if (slug === "hello-kitty") return (zh ? "七位三丽鸥角色结果：全部完整指南" : "Seven Sanrio character results: all complete guides");
if (slug === "star-wars-character") return (zh ? "七位星球大战角色结果：全部完整指南" : "Seven Star Wars character results: all complete guides");
if (slug === "bleach") return (zh ? "七位BLEACH角色结果：全部完整指南" : "Seven BLEACH character results: all complete guides");
if (slug === "death-note") return (zh ? "八位角色结果：主系列与短篇的完整指南" : "Eight character results: main-series and short-story guides");
if (slug === "naruto-character") return (zh ? "七位角色结果：全部完整指南" : "Seven character results: all complete guides");
if (slug === "disney-princess") return (zh ? "十三位角色结果：全部完整指南" : "Thirteen character results: all complete guides");
if (slug === "chiikawa") return (zh ? "六位角色结果：全部完整指南" : "Six character results: all complete guides");
if (slug === "bojack-horseman-character-quiz") return (zh ? "五位角色结果：全部完整指南" : "Five character results: all complete guides");
if (slug === "moon-phase") return (zh ? "月相测试结果：八种意象的完整指南" : "Moon Phase Test results: eight complete image guides");
if (slug === "past-life") return (zh ? "前世测试结果：八种角色意象与完整指南" : "Past Life Quiz results: eight role images and full guides");
if (slug === "aura-color") return (zh ? "红橙黄绿蓝靛紫：全部完整结果指南" : "Seven colors: all complete result guides");
if (slug === "what-element-am-i") return (zh ? "火、水、土、风（气）：全部完整结果指南" : "Fire, Water, Earth and Air: all complete result guides");
if (slug === "which-tarot-card-are-you") return (zh ? "22张大阿尔卡那：全部完整结果指南" : "22 Major Arcana: all complete result guides");
if (slug === "greek-god") return (zh ? "六种神话主题：全部完整结果指南" : "Six myth themes: all complete result guides");
if (slug === "hogwarts-house-quiz") return (zh ? "四学院主题：全部完整结果指南" : "Four house themes: all complete result guides");
if (slug === "tsundere-dere-type") return (zh ? "四种表达原型：完整结果指南" : "Four expression tropes: complete result guides");
if (slug === "character-strengths") return (zh ? "24项性格优势：全部完整结果指南" : "24 character strengths: all complete result guides");
if (slug === "learning-style") return (zh ? "四种学习形式：全部完整结果指南" : "Four learning formats: all full result guides");
if (slug === "procrastinator-type-test") return (zh ? "六种拖延模式：全部完整结果指南" : "Six procrastination patterns: all full result guides");
if (slug === "likable-person-test") return (zh ? "31种完整结果：五种侧重与全部最高并列" : "Thirty-one full guides: five emphases and all leading ties");
if (slug === "difficult-person-test") return (zh ? "七类互动行为：全部完整结果指南" : "Seven interaction patterns: all full result guides");
if (slug === "people-pleaser") return (zh ? "PPS三部分：全部完整结果指南" : "Three PPS parts: all full result guides");
if (slug === "music-taste-test") return (zh ? "八类音乐偏好：全部完整结果指南" : "Eight music preferences: all full result guides");
if (slug === "aesthetic-core-test") return (zh ? "六种视觉风格：完整结果阅读指南" : "Six full guides to visual styles");
if (slug === "travel-personality-test") return (zh ? "六种旅行偏好：完整结果阅读指南" : "Six full guides to travel preferences");
if (slug === "humor-style-test") return (zh ? "六种幽默表达：完整结果阅读指南" : "Six full guides to humor expressions");
if (slug === "leadership-style") return (zh ? "四种领导风格的完整指南与情境取舍" : "Four full leadership guides and situational tradeoffs");
if (slug === "communication-style") return (zh ? "四种沟通方式的完整指南与情境比较" : "Four full communication guides and situational comparisons");
if (slug === "attachment-styles") return (zh ? "依恋风格完整指南：四种原型与两维读法" : "Attachment style guides: four prototypes and two dimensions");
if (slug === "disc") return (zh ? "DISC测试结果：四个方向与全部15种组合" : "DISC results: four directions and all 15 leader combinations");
if (slug === "introvert-extrovert") return (zh ? "四个阅读区间的完整公开指南" : "Four full guides to the reading bands");
if (slug === "jungian-archetype") return (zh ? "十二原型完整结果指南与相近主题比较" : "Twelve complete archetype guides and theme comparisons");
if (slug === "moral-alignment") return (zh ? "九种道德阵营的完整结果指南" : "Complete guides to the nine moral alignments");
if (quiz.kind === "mental-age") return (zh ? "全部娱乐年龄的完整公开指南" : "Complete public guide to every playful age");
if (quiz.kind === "mini-orientation") return (zh ? "五个观察主题的完整公开指南" : "Five complete public reflection-topic guides");
if (quiz.kind === "mini-conflict") return (zh ? "四组行为观察的完整公开指南" : "Four complete public behavior guides");
if (quiz.kind === "mini-virtues") return (zh ? "七组完整公开读法" : "Seven complete public readings");
if (quiz.kind === "pss4") return (zh ? "PSS-4完整公开指南" : "The complete PSS-4 guide");
if (quiz.kind === "stress-reflection4") return (zh ? "本次月度回看的完整公开指南" : "The complete monthly check-in guide");
if (quiz.kind === "four-axes") return (zh ? "四个领域的完整公开指南" : "Four complete public domain guides");
if (quiz.kind === "mini-shadow") return (zh ? "五组压力反应的完整公开指南" : "Five complete public response guides");
if (quiz.kind === "preparation-actions20") return (zh ? "五组准备行动的完整公开指南" : "Five complete preparation-action guides");
if (quiz.kind === "mini-coping") return (zh ? "四组应对选择的完整公开指南" : "Four complete public coping-choice guides");
if (quiz.kind === "mini-habit") return (zh ? "五个部分的完整公开指南" : "Five complete public habit guides");
if (quiz.kind === "mini-intimacy") return (zh ? "四个部分的完整公开指南" : "Four complete public preference guides");
if (quiz.kind === "mini-breakup") return (zh ? "四组关系复盘的完整指南" : "Four complete breakup-reflection guides");
if (quiz.kind === "holding-back35") return (zh ? "七个主题的完整日常观察指南" : "Seven complete everyday topic guides");
if (quiz.kind === "fscrs22") return (zh ? "三个部分的完整公开解释" : "Three complete public explanations");
if (quiz.kind === "mini-friction") return (zh ? "五组互动线索的完整读法" : "Five full interaction readings");
if (quiz.kind === "ctl41") return (zh ? "六源领域的完整读法" : "Six full source-domain readings");
if (quiz.kind === "interaction-pairs") return (zh ? "四组互动选择的完整读法" : "Four full interaction-choice readings");
if (quiz.kind === "work-role12") return (zh ? "三类任务的完整公开指南" : "Three complete public task-context guides");
if (quiz.kind === "skills-evidence") return (zh ? "四类任务实例的完整指南" : "Four full task-example guides");
if (quiz.kind === "tipi10") return (zh ? "五个大五维度的完整公开读法" : "Five full Big Five domain guides");
if (quiz.kind === "saps") return (zh ? "两个维度的完整公开读法" : "Two complete public dimension guides");
if (quiz.kind === "scs26") return (zh ? "整体与六部分的完整读法" : "Full readings for the overall mean and six parts");
if (quiz.kind === "practice") return (zh ? "全部分项复习说明" : "All section revision guides");
if (["self-esteem", "social-intelligence-test", "locus-of-control", "growth-mindset-fixed-mindset"].includes(quiz.slug)) return (zh ? "完整连续读法" : "Read the full continuum");
return (zh ? "全部结果说明" : "Explore every result");
})()}</h2><p className="my-4 leading-8 text-slate-600">{(() => {
if (slug === "disc") return (zh ? "下面是公开的结果阅读指南，不是当前访客的私人作答。四项单方向与全部最高并列共15种组合均有完整说明，包括行为例子、情境取舍、计分读法与动物标签对照。先阅读指南不会改动之后的题目或计分规则。" : "These are public reading guides, not the current visitor’s private result. All 15 single-direction or highest-count tied combinations have complete explanations, including behavioral examples, contextual trade-offs, scoring and animal-label comparisons. Reading them does not change the questions or scoring rules.");
if (quiz.kind === "mental-age") return (zh ? "18至90的37个偶数娱乐年龄，共用这一份完整连续读法。这里不含个人数字或答案，不设年龄类型、成熟度等级或并列派型。" : "All 37 even playful ages from 18 to 90 share one complete continuous reading. It contains no personal values or answers, without age types, maturity levels or tied classifications.");
if (quiz.kind === "mini-orientation") return (zh ? "五篇完整通用指南可在作答前阅读，不含个人回答或分布。每主题四条陈述，只分别计五个数字选项及跳过次数；不相加为分数、不求均值、不排名或生成身份。暂不确定包含在数字回答中；二十题均明确跳过时不生成个人领域解释。" : "Read all five complete general guides before answering, without personal responses or distributions. Each topic has four statements, with separate counts for five numeric choices and skips. No score, mean, ranking or identity is produced. Uncertain choices are included among numeric responses; all twenty explicitly skipped suppresses personal domain explanations.");
if (quiz.kind === "mini-conflict") return (zh ? "四篇全文分别解释冲突加压、面对拒绝与暂停、回应影响和修复跟进的原题范围、算例与可选事实观察。24题均选择数字或明确跳过后，各组至少四个数字才显示个人原始和与均值；3为不确定或视情况，不合总分、不排名、不判定危险。全部通用全文可先读，不含个人回答或数值。" : "Four full guides explain the statements, arithmetic and optional fact checks for conflict pressure, boundaries, impact and repair follow-through. After all 24 numbers or explicit skips, each group needs four numeric answers for a personal sum and mean. A 3 is uncertain or depends. There is no total, ranking or danger judgment. Read all general guides first, without personal responses or values.");
if (quiz.kind === "mini-virtues") return (zh ? "七份全文均可先读。完成28题后，查看七宗罪和七美德各自的得分与十四维雷达。" : "Read all seven full guides before answering. Finish 28 items to see separate scores for the seven sins and virtues on a 14-axis radar.");
if (quiz.kind === "mini-shadow") return (zh ? "五篇完整指南分别解释退开或延后、收紧安排、先维持和气、快速解释立场、暂时少说的题目范围、算例、情境和可选观察。全部20题有效后，五组各四题独立显示原始和与均值；3为不确定或视情况。不合总分、不排名，不从符合程度推断发生频率、严重度或隐藏人格。全部全文可先读，公开页不含个人回答或数值。" : "Five complete guides explain the statements, arithmetic, contexts and optional observations for stepping away or delaying, tightening arrangements, maintaining harmony, explaining a position quickly, and saying less. After all 20 valid responses, each four-item group has its own sum and mean; a 3 is valid uncertainty or depends. There is no total or ranking, and agreement does not establish frequency, severity or a hidden personality. Read all full guides first; public pages contain no personal responses or values.");
if (quiz.kind === "preparation-actions20") return (zh ? "五份完整指南按固定顺序开放，包含具体情境、相近数值的区别和可选小试验。全部不计分仍可完整阅读；公开页不含个人选择、均分或准备率，可先读再决定是否作答。" : "Five complete guides stay available in a fixed order, with concrete situations, different gaps behind close values and optional small rehearsals. Even all non-rating choices keep every full guide. Public pages contain no personal selections, means or readiness percentages; read before deciding whether to answer.");
if (quiz.kind === "mini-coping") return (zh ? "四篇全文分别讨论尝试与评估、表达与私下整理、调整与保持结构、眼前需要与未来安排。24题全部有效作答后，四组各六次比较只记录两侧次数，3:3保留并列；不合总分、跨组排名或综合类型，也不测心理年龄、成熟度或能力。全部八侧说明都可先读，公开指南不含个人次数或选项。" : "Four complete guides cover trying and assessing, expressing and processing privately, adapting and keeping structure, and present needs and future plans. After all 24 valid choices, each group records two counts across six comparisons; a 3:3 tie keeps both sides. There is no overall total, cross-group ranking or combined type, and no measurement of psychological age, maturity or ability. Read all eight sides before answering; public guides contain no personal counts or options.");
if (quiz.kind === "mini-habit") return (zh ? "五篇完整指南分别讨论触发与冲动、自动启动、挤占安排、发现不便后仍继续和日常影响，均可先读。每组四题至少有三个数字回答才给独立原始和与均值；不合总分、不排名。信息不足不推断个人因素，全部跳过也可结束；公开指南不含个人回答或数值。" : "Five complete guides cover cues and urges, automatic starts, displaced plans, continuing after inconvenience and everyday effects. Read them before answering. Each four-item part needs at least three numeric responses for its separate sum and mean, without an overall total or ranking. Insufficient information yields no personal factor interpretation; all skips can finish the form. Public guides contain no personal answers or values.");
if (quiz.kind === "mini-intimacy") return (zh ? "四篇全文分别讨论情感分享、身体靠近与边界、共同和个人时间、对外表达与隐私。每组六题数值完整才显示该组原始和与均分；不合总分、不排名，不用偏好代替当下同意。全部指南可先读，也不要求注册或分享私人答卷。" : "Four full guides cover emotional sharing, physical closeness and boundaries, shared and personal time, and visibility and privacy. Each group needs all six numeric responses for its own sum and mean. There is no overall total or ranking, and preferences do not replace present consent. Read every guide before answering, without signup or sharing a private attempt.");
if (quiz.kind === "mini-breakup") return (zh ? "四份完整指南分别整理一段已结束关系的沟通、需要与期待、边界与信任、外部压力。每组六题完整才给独立均分；3是有效的不确定中点，不计分不补零。所有全文始终开放，不分主因、责任、适配或复合结论。公开页不含个人回答、数值或私人关系记录。" : "Four full guides review communication, needs and expectations, boundaries and trust, and external pressures around one relationship that ended. Each group needs all six numeric answers for its separate mean. The numeric midpoint 3 means uncertain; unscored choices are not zero. All guides remain open without a main-cause verdict, blame, compatibility or reconciliation decision. Public pages contain no personal answers, values or private relationship record.");
if (quiz.kind === "holding-back35") return (zh ? "七份完整指南均可先读。完成后七个主题按固定顺序分别呈现，每项五题数值齐全才给描述性均分。任一不计分仅使所在组均分暂不可用；即使35题都不计分，也能结束并阅读每份完整指南。" : "All seven complete guides are public. A completed check-in presents the topics separately in their fixed order. A topic needs all five numeric choices for its descriptive mean. Any unscored choice withholds only that mean; even all 35 unscored choices finish and retain every guide.");
if (quiz.kind === "fscrs22") return (zh ? "不足感、对自己的厌恶与自我安慰分别阅读。任一条跳过只使所属部分不计分，不合总分或选择主声音；三份完整解释与支持说明不要求透露答案。" : "Read inadequacy, self-hatred and self-reassurance separately. A skip withholds only its own part, with no total or winning voice. All three complete explanations and support information are available without disclosing answers.");
if (quiz.kind === "mini-friction") return (zh ? "五组完整指南均可先读。二十题全部有效才显示个人四题原始和与均值，中点3为合法数值；不排名、不合总分、不确定他人讨厌或原因。缺答暂停全部个人解释，公开页不含私人答卷。" : "Read all five full guides first. All twenty valid responses are needed for personal four-item sums and means; midpoint 3 is numeric. There is no ranking, total or conclusion about another person’s dislike or reason. Missing responses suppress every personal interpretation. Public guides contain no private attempt.");
if (quiz.kind === "ctl41") return (zh ? "六源领域完整指南均可先读。四十一项全部有效后，六域分别呈现计分和与均值，不合总分或爱的能力等级。源无NA，可退出无分阅读。新中译与网页呈现未独立验证，公开页不含私人答卷。" : "Read all six source-domain guides first. All forty-one valid responses are needed for six separate keyed sums and means, without an overall score or love-capacity level. The source has no NA; you may exit and read without a score. The new translation and web display have no independent validation. Public pages contain no private attempt.");
if (quiz.kind === "interaction-pairs") return (zh ? "24次二选一全部有效后，四组各六题分别显示两侧原始次数，3:3保留两侧。四篇完整指南均可先读，不合成魅力类型，不推断他人好感。" : "After all 24 valid paired choices, four groups show separate raw counts across six comparisons each. A 3:3 tie keeps both sides. All four full guides are public, without a combined attractiveness type or an inference about other people’s liking.");
if (quiz.kind === "skills-evidence") return (zh ? "20项任务记录近期、更早、探索或暂不记录，四类各五项的状态计数合计五。全部暂不记录也能完成，四篇全文始终开放；不评表现质量，不算能力分、熟练等级或岗位匹配。" : "Twenty tasks record recent, older, explore or not-recorded states. Each five-task group’s counts sum to five. All-not-recorded can finish, and all four guides remain public. There is no performance-quality rating, ability score, proficiency level or job match.");
if (quiz.kind === "saps") return (zh ? "两篇完整公开指南分别解释SAPS标准与差距。源八题使用七级同意程度，两个维度各四题分别求均值或总和；八题均有效才显示个人汇总，不补缺答、不合总分、不分类型或百分位。中文为经费马编辑复核、尚未独立验证的工作译稿。" : "Two complete public guides explain SAPS Standards and Discrepancy. The eight source items use seven agreement choices; each four-item dimension has its own mean and sum. All eight responses must be valid, without imputation, a combined total, types or percentiles. Chinese is a working translation reviewed by FermatMind editors, without independent validation.");
if (quiz.kind === "scs26") return (zh ? "七份完整公开指南分别解释整体均分与六个部分，不是阶段、赢家或私人答卷。按完整26题SCS先算六部分未取舍的均值再平均；三个负向部分同时标出原始与反向方向。跳一题只暂不给所属部分及整体均分，其他完整部分仍可读。所有指南始终公开免费；中文为尚未验证的新工作译本。" : "Seven complete public guides explain the overall mean and six components, without stages, winners or private attempts. The full 26-item SCS first computes six unrounded part means, then averages them. Negative parts label both raw and reversed directions. A skip withholds its part and the overall mean; other complete parts remain readable. All guides stay public and free. Chinese is a new unvalidated working translation.");
if (quiz.kind === "cbi") return (zh ? "两份完整公开指南分别解释个人与工作相关耗竭，采用NFA原始个人六题与工作七题完整模块；不施测服务对象相关六题，不是完整十九题或新验证短版。个人至少三项、工作至少四项有效才有所属0—100分数点均分，缺失不补0，不合成总分或风险等级。中文为费马工作译文，没有建立本地效度或跨语言等值。公开页不包含个人回答或均分，可先读、选择适当支持，或结束。" : "Two complete public guides explain personal and work-related exhaustion using NFA’s complete six-item personal and seven-item work modules. Client-related items are not administered; this is not the full nineteen-item inventory or a newly validated short form. A mean in 0–100 score points requires at least three valid personal or four valid work ratings. Missing is not zero, and there is no combined total or risk band. Chinese is a FermatMind working translation without established local validity or equivalence. Public pages contain no personal answers or means; read first, consider suitable support or stop.");
if (quiz.kind === "rosenberg") return (zh ? "一份完整公开指南覆盖0—30原始总分的连续读法、不同回答组合与资料不足。十题全部有效才显示总分，不套统一正常区间、分档或人格类型。原题为公有领域英文条目，中文为新的费马工作译文，尚未建立效度或跨语言等值；公开页不包含个人回答或分数，可先读再决定是否作答。" : "One complete public guide covers the 0–30 raw-total continuum, different response patterns and insufficient information. All ten scale responses are required for a total. No universal normal range, bands or personality types are applied. English items are public domain; Chinese is a new FermatMind working translation without established validity or cross-language equivalence. Public pages contain no personal answers or scores; read before deciding whether to answer.");
if (quiz.kind === "political-coordinates") return (zh ? "四份完整公开指南比较本原创题本的两轴组合，不是固定人格或政党身份。36项全部选择后，两轴各十八项分别显示两端原始次数和差值；零轴保留相邻比较，任一NA只使所属轴不足。四份全文始终可读，公开页不含个人答案或坐标，可先读再决定是否作答。" : "Four complete public guides compare combinations of the two axes in this original bank, not fixed personalities or party identities. After all 36 selections, each eighteen-item axis shows its endpoint counts and raw difference separately. A zero axis retains adjacent comparisons; any NA withholds only its own axis. All four full texts stay available. Public pages contain no personal answers or coordinates; read before deciding whether to answer.");
if (quiz.kind === "practice") return (zh ? "每个分项都有公开复习说明，完成练习后会同时显示全部说明和逐题答案解析，不按高低分派型。公开说明不包含个人答卷或正确数；可以先学习再练习，这不是保密考试。" : "Every section has a public revision guide. Completing the practice shows every guide and item explanation without assigning a type by score. Public guides contain no personal responses or counts; studying before practice is welcome. This is not a secure exam.");
if (quiz.slug === "social-intelligence-test") return (zh ? "这一份九节说明完整覆盖四条自述的较高、较低、中间混合和资料不足，含原始总分、反向计分、例子与核对。不是从五种社交角色中选一页；公开说明不含个人答卷或分数，可先读再决定是否作答。" : "One nine-section guide covers higher, lower, middle or mixed self-reports and insufficient information, with raw sums, reverse keys, examples and checks. It is not selected from five social roles. Public pages contain no personal answers or scores; read before deciding whether to answer.");
if (quiz.slug === "empathy") return (zh ? "这一份十二节完整指南覆盖关怀倾向连续读数与资料不足，提供算例、沟通场景、可选行动和来源边界。没有四档派型或两个人造分量表；公开页不包含个人答案与分数，可先读再决定是否作答。" : "One complete twelve-section guide covers the continuous Compassion reading and insufficient information, with worked examples, conversations, optional actions and source limits. There are no four-band types or two invented subscores. Public pages contain no personal answers or values; read first if you prefer.");
if (quiz.slug === "locus-of-control") return (zh ? "这一份完整说明覆盖IPIP整体原始总分的较高、较低、中间混合与资料不足，包含例子、反例和版本边界。它不按四档派型，公开页没有个人答案或分数，可先读再决定是否作答。" : "One full guide covers higher, lower, middle or mixed IPIP totals and insufficient information, with examples, counterexamples and edition limits. It assigns no four-band type. Public pages contain no personal answers or scores; read before deciding whether to answer.");
if (quiz.slug === "growth-mindset-fixed-mindset") return (zh ? "这份九模块说明完整覆盖连续均分的较高、较低、中间混合与资料不足。它始终公开，不是从多个类型中选中一页；这里没有个人答案或均分，可以先读再决定是否作答。" : "One nine-section guide covers higher, lower, middle or mixed means and insufficient information. It stays public rather than being selected from multiple types. No personal answers or means appear here; read it before deciding whether to answer.");
if (quiz.kind === "pss4") return (zh ? "完整指南说明四题原始计分、反向项、月时间窗及参照限制。无需答题即可阅读，不按总分派通用严重度。" : "Read the complete guide to the four-item raw total, reverse keys, monthly timeframe and reference limits before answering. No universal severity bands are assigned.");
if (quiz.kind === "stress-reflection4") return (zh ? "同一篇完整指南覆盖原创0—16总分的整个范围、混合回答、算例与情境。公开页面不含个人回答或总分，答题前即可阅读；不按分数派严重度或人格标签。" : "One complete guide covers the original 0–16 range, mixed responses, arithmetic and context. This public page contains no personal answers or totals and can be read before answering, without severity bands or personality labels.");
if (quiz.kind === "four-axes") return (zh ? "四份完整指南分别解释每条轴的两端、居中与情境差异。全部60题有效后，四条位置及四篇全文同时呈现，不合成类型。公开页面不含个人答案或位置，答题前即可阅读。" : "Four complete guides explain both ends, middle positions and context on each axis. All 60 valid responses show four positions and all four full readings together, without a combined type. Public pages contain no personal answers or positions and can be read before answering.");
if (quiz.kind === "eight-values") return (zh ? "八份完整公开读法解释四轴两端，含较高、较低、中间混合与版本边界。完整作答后四轴及全部八份指南同时呈现，不按最高值派人格或意识形态。公开页不含个人答案或百分数，可先读再决定是否作答。" : "Eight complete public guides explain both ends of four axes, including higher, lower and mixed values and edition limits. A complete attempt shows all four axes and all eight guides together, without assigning a highest-value personality or ideology. Public pages contain no personal answers or percentages; read before deciding whether to answer.");
if (quiz.kind === "compass") return (zh ? "12份完整说明包括四向基础读法和八份有序相邻读法。所有最高方向分别保留全文；邻向同分明确未分出，不叫纯人格。可先读全部说明，公开页不含个人答案或次数。" : "Twelve full guides cover four base readings and eight ordered neighbouring readings. Every highest direction retains its full explanation; equal neighbours stay undistinguished rather than becoming a pure personality. Read all guides first, without private answers or counts.");
if (quiz.kind === "attachment") return (zh ? "以下四份成人原型说明比较关系担心与亲近退缩的不同组合，不关联个人答卷。完成24题后分别看两项均分与有效题数，不按固定阈值派类型；资料不足明确保留。" : "These four adult prototype guides compare combinations of relationship worry and distance from closeness without personal attempts. After all 24 selections, read two means and rated counts separately, without fixed type cutoffs. Insufficient information remains explicit.");
if (quiz.kind === "affection") return (zh ? "五种关心方式各有表达与接收两侧，完整作答后呈现十项均分或资料不足状态。以下五份双向说明都可先读，不是你的个人分数或固定类型。" : "Each of five ways has a giving and receiving side. A complete attempt shows ten means or insufficient-information states. All five two-sided guides are available here before answering; they are not your personal scores or fixed types.");
if (quiz.kind === "optimism") return (zh ? "五份完整公开读法组织一个连续总分，不是官方人格类型。十条全部有效才显示个人分数，18、26、34、42边界同时完整呈现相邻两份。公开页不含个人答案或分数。" : "Five full public guides organise one continuous total rather than official personality types. All ten ratings are required for a personal score; totals of 18, 26, 34 and 42 keep both adjacent full guides. Public pages contain no personal answers or scores.");
if (quiz.kind === "extraversion") return (zh ? "四种完整公开读法帮助理解一个连续维度，不是固定人格分类。十项全部有效才显示个人分数；恰逢阅读边界时，相邻两份报告都完整呈现。公开页不含个人答案或分数。" : "Four full public guides help read one continuous dimension, rather than fixed personality categories. All ten ratings are required for a personal score; at a reading boundary, both adjacent full reports appear. Public pages contain no personal answers or scores.");
if (quiz.kind === "alignment") return (zh ? "九种阵营均有完整公开说明，可在作答前比较。完成后分别显示两轴计数、九宫格和所有边界匹配；公开页面不含个人答案或计数。" : "Compare all nine full public alignment guides before answering. A complete attempt shows separate axis counts, the grid and every boundary match. Public pages contain no personal answers or tallies.");
if (["overthinking-screener", "executive-function", "sensory-processing-test", "conservatism", "food-disgust", "tipi-10", "parenting-style", "love-type-16"].includes(slug)) return (zh ? `以下${quiz.profiles.length}份完整公开指南均可在作答前阅读，说明本题本的结果读法，不包含任何人的个人答案或分数；具体结果关系请参照上方方法。` : `Read ${quiz.profiles.length === 1 ? "the complete public guide" : `all ${quiz.profiles.length} complete public guides`} below. These are reference explanations, not anyone’s personal answers or scores. The method above explains how this edition organizes results.`);
if (quiz.kind === "likert") return (zh ? `下方完整解释${quiz.directions.length}部分各自在观察什么。它们会在完成后同时呈现，不是互斥的人格类型；公开说明不关联任何人的答案或均分。` : `Read what each of the ${quiz.directions.length} parts explores. Your complete result presents them together; they are not mutually exclusive personality types. These public guides contain no one’s answers or personal means.`);
if (quiz.kind === "archetype") return (zh ? `下方列出全部${quiz.profiles.length}份结果的完整公开说明，不关联个人作答。最高计数并列时，每份匹配报告都会完整呈现；你也可以先比较其他结果。` : `Read all ${quiz.profiles.length} complete public result guides below. They contain no private attempts. Every highest-count tie gets its full report, and you can compare other results before answering.`);
if (quiz.slug === "likable-person-test") return (zh ? "全部31份公开说明覆盖五个单项与每种最高并列组合，不含任何人的答案或计数。五项相同各4次时，不指定唯一顶部；结果不是他人评价或固定人格。" : "All 31 public guides cover five single directions and every highest-count tie, without personal answers or counts. Five equal counts of four produce no sole leader. Results are neither observer ratings nor fixed personalities.");
return (zh ? `下面是公开说明，不是任何人的私人作答。全部${quiz.directions.length}个单项和并列组合均有完整报告；先阅读也不会影响你的计分。` : `These are public explanations, not anyone's private attempt. Full reports cover all ${quiz.directions.length} single directions and every tied combination. Reading one does not affect your score.`);
})()}</p><ul className="space-y-4">{quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-5"><Link prefetch={false} className="inline-block min-h-11 py-2 text-lg font-semibold underline" href={questionnaireGuidePath(locale, slug, profile.id)}>{profile.title[locale]}</Link><p className="mt-2 leading-8 text-slate-700">{(() => {
if (slug === "disc") return discLandingSummary(profile, locale);
if (slug === "response-color") return responseColorLandingSummary(profile, locale);
if (slug === "moral-alignment") return moralAlignmentLandingSummary(profile, locale);
if (slug === "jungian-archetype") return jungianArchetypeLandingSummary(profile, locale);
if (slug === "greek-god") return greekLandingSummary(profile, locale);
if (slug === "hogwarts-house-quiz") return hogwartsLandingSummary(profile, locale);
if (slug === "tsundere-dere-type") return dereLandingSummary(profile, locale);
if (slug === "character-strengths") return strengthsLandingSummary(profile, locale);
if (slug === "learning-style") return learningLandingSummary(profile, locale);
if (slug === "procrastinator-type-test") return procrastinationLandingSummary(profile, locale);
if (slug === "likable-person-test") return likableLandingSummary(profile, locale);
if (slug === "difficult-person-test") return frictionLandingSummary(profile, locale);
if (slug === "people-pleaser") return peoplePleaserLandingSummary(profile, locale);
if (slug === "music-taste-test") return musicLandingSummary(profile, locale);
if (slug === "aesthetic-core-test") return aestheticLandingSummary(profile, locale);
if (slug === "travel-personality-test") return travelLandingSummary(profile, locale);
if (slug === "humor-style-test") return humorLandingSummary(profile, locale);
if (slug === "leadership-style") return leadershipLandingSummary(profile, locale);
if (slug === "communication-style") return communicationLandingSummary(profile, locale);
if (slug === "attachment-styles") return attachmentLandingSummary(profile, locale);
if (slug === "love-languages") return loveLanguagesLandingSummary(profile, locale);
if (slug === "temperament") return temperamentLandingSummary(profile, locale);
if (slug === "introvert-extrovert") return introvertExtrovertLandingSummary(profile, locale);
if (slug === "moon-phase") return moonPhaseLandingSummary(profile, locale);
if (slug === "bojack-horseman-character-quiz") return bojackLandingSummary(profile, locale);
if (slug === "chiikawa") return chiikawaLandingSummary(profile, locale);
if (slug === "disney-princess") return disneyPrincessLandingSummary(profile, locale);
if (slug === "naruto-character") return narutoLandingSummary(profile, locale);
if (slug === "death-note") return deathNoteLandingSummary(profile, locale);
if (slug === "bleach") return bleachLandingSummary(profile, locale);
if (slug === "star-wars-character") return starWarsLandingSummary(profile, locale);
if (slug === "hello-kitty") return helloKittyLandingSummary(profile, locale);
return profile.summary[locale];
})()}</p></li>)}</ul></section>
    <section className="my-8 space-y-5 leading-8" aria-labelledby="questionnaire-faq"><h2 id="questionnaire-faq" className="text-2xl font-semibold">{(() => {
if (slug === "cyberpunk-edgerunners") return (zh ? "《边缘行者》角色测试常见问题" : "Cyberpunk: Edgerunners Test: frequently asked questions");
if (slug === "love-type-16") return (zh ? "爱情类型测试与并列组合常见问题" : "Love Type Test and tied combinations: frequently asked questions");
if (slug === "food-disgust") return (zh ? "食物厌恶测试与FDS计分常见问题" : "Food Disgust Test and FDS scoring: frequently asked questions");
if (slug === "energy-flow") return (zh ? "精力与专注节奏自评常见问题" : "Energy and focus self-report: frequently asked questions");
if (slug === "mental-age") return (zh ? "心理年龄测试与娱乐公式常见问题" : "Mental Age Test and playful scoring: frequently asked questions");
if (slug === "stupidity-test") return (zh ? "日常乌龙与犯蠢测试常见问题" : "Everyday mix-ups and the Stupidity Test: frequently asked questions");
if (slug === "tech-savvy") return (zh ? "技术素养与工具信心自评常见问题" : "Tech Savvy and tool-confidence self-ratings: frequently asked questions");
if (slug === "orientation-exploration-test") return (zh ? "取向探索与私人回答记录常见问题" : "Orientation exploration and private response records: frequently asked questions");
if (slug === "sake-type") return (zh ? "酒水类型测试常见问题" : "Sake Type game: frequently asked questions");
if (slug === "stress-check-in-test") return (zh ? "近一个月压力自评常见问题" : "Monthly Stress Check-In: frequently asked questions");
if (slug === "conflict-boundary-behaviors-test") return (zh ? "冲突与边界行为观察常见问题" : "Conflict and boundary behavior reflection: frequently asked questions");
if (slug === "four-axes-test") return (zh ? "四轴自我画像测试常见问题" : "Four Axes Self-Portrait Test: frequently asked questions");
if (slug === "seven-sins-virtues-test") return (zh ? "七宗罪与七美德测试常见问题" : "Seven Sins and Virtues Test: frequently asked questions");
if (slug === "euphoria-character-quiz") return (zh ? "《亢奋》角色测试常见问题" : "Euphoria character quiz: frequently asked questions");
if (slug === "stress-response-patterns-test") return (zh ? "压力反应观察测试常见问题" : "Stress Response Patterns Test FAQ");
if (slug === "remote-work") return (zh ? "远程工作准备程度测试常见问题" : "Remote Work Readiness Test FAQ");
if (slug === "freelance-ready") return (zh ? "自由职业准备程度测试常见问题" : "Freelance Readiness Test FAQ");
if (slug === "coping-rhythm-test") return (zh ? "应对节奏测试常见问题" : "Coping Rhythm Test FAQ");
if (slug === "habit-patterns-test") return (zh ? "习惯模式测试常见问题" : "Habit Patterns Test FAQ");
if (slug === "intimacy-preference-test") return (zh ? "亲密偏好测试常见问题" : "Intimacy Preferences Test FAQ");
if (slug === "disc") return (zh ? "DISC测试常见问题" : "DISC test: frequently asked questions");
if (slug === "color-season") return (zh ? "色彩季节测试常见问题" : "Color Analysis Quiz FAQ");
if (slug === "problem-solving-critical-thinking") return (zh ? "问题解决与批判性思维测试常见问题" : "Problem-Solving and Critical Thinking Test FAQ");
if (slug === "word-skills") return (zh ? "Word技能测试常见问题" : "Word Skills Test FAQ");
if (slug === "project-management") return (zh ? "项目管理测试常见问题" : "Project Management Test FAQ");
if (slug === "rizz-test") return (zh ? "Rizz测试常见问题" : "Rizz Test FAQ");
if (slug === "personal-finance-literacy") return (zh ? "个人理财素养测试常见问题" : "Financial Literacy Test FAQ");
if (slug === "ai-literacy") return (zh ? "人工智能素养测试常见问题" : "AI Literacy Test FAQ");
if (slug === "chinese-zodiac") return (zh ? "中国十二生肖测试常见问题" : "Chinese Zodiac Quiz FAQ");
if (slug === "customer-service-aptitude") return (zh ? "客户服务情景测试常见问题" : "Customer Service Test FAQ");
if (slug === "german-proficiency") return (zh ? "德语水平测试常见问题" : "German Test FAQ");
if (slug === "zodiac-sign-quiz") return (zh ? "星座测试常见问题" : "Zodiac Sign Quiz FAQ");
if (slug === "love-personality") return (zh ? "恋爱人格测试常见问题" : "Love Personality Test FAQ");
if (slug === "situational-judgement") return (zh ? "情境判断测试常见问题" : "Situational Judgement Test FAQ");
if (slug === "8-values-political") return (zh ? "8 Values政治价值观测试常见问题" : "8 Values Political Test FAQ");
if (slug === "relationship-values") return (zh ? "爱情阵营测试常见问题" : "Relationship Values Test FAQ");
if (slug === "hexaco") return (zh ? "HEXACO人格测试常见问题" : "HEXACO Personality Test FAQ");
if (slug === "relationship-preferences") return (zh ? "恋爱安排偏好测试常见问题" : "Relationship Preferences Test FAQ");
if (slug === "abstract-reasoning") return (zh ? "抽象推理测试常见问题" : "Abstract Reasoning Test FAQ");
if (slug === "conservatism") return (zh ? "保守主义测试常见问题" : "Conservatism Test FAQ");
if (slug === "numerical-reasoning") return (zh ? "数值推理测试常见问题" : "Numerical Reasoning Test FAQ");
if (slug === "digital-ethics-citizenship") return (zh ? "数字伦理与公民意识测试常见问题" : "Digital Ethics and Citizenship Test FAQ");
if (slug === "adult-age-preferences") return (zh ? "年上年下情境偏好测试常见问题" : "Adult Age-Preference Quiz FAQ");
if (slug === "toxic-positivity-test") return (zh ? "有毒积极心态测试常见问题" : "Toxic Positivity Test: frequently asked questions");
if (slug === "friendship-compatibility") return (zh ? "友谊契合度测试常见问题" : "Friendship Compatibility Test: frequently asked questions");
if (slug === "perfectionism") return (zh ? "SAPS完美主义测试常见问题" : "SAPS Perfectionism Test: frequently asked questions");
if (slug === "apology-language") return (zh ? "道歉语言测试常见问题" : "Apology Language Test: frequently asked questions");
if (slug === "mote-type") return (zh ? "魅力类型测试常见问题" : "Mote Type Test: frequently asked questions");
if (slug === "jealousy-scale") return (zh ? "嫉妒量表常见问题" : "Jealousy Scale: frequently asked questions");
if (slug === "sternberg-love") return (zh ? "斯特恩伯格爱的三角测试常见问题" : "Sternberg Love Triangle Test: frequently asked questions");
if (slug === "annoying-person-test") return (zh ? "烦人性格测试常见问题" : "Annoying Person Test: frequently asked questions");
if (slug === "love-fight-style") return (zh ? "爱情吵架风格测试常见问题" : "Love Fight Style Test: frequently asked questions");
if (slug === "capacity-to-love-test") return (zh ? "爱的能力测试常见问题" : "Capacity to Love Test: frequently asked questions");
if (slug === "executive-function") return (zh ? "执行功能测试常见问题" : "Executive Function Test: frequently asked questions");
if (slug === "hsp-sensitivity-quiz") return (zh ? "高敏感体验反思常见问题" : "HSP Sensitivity Reflection: frequently asked questions");
if (slug === "competency-test") return (zh ? "职业胜任力反思常见问题" : "Competency Check-In: frequently asked questions");
if (slug === "sensory-processing-test") return (zh ? "感觉加工问卷SPQ常见问题" : "Sensory Perception Quotient: frequently asked questions");
if (slug === "parenting-style") return (zh ? "育儿风格测试常见问题" : "Parenting Style Test: frequently asked questions");
if (slug === "inner-critic-voice-test") return (zh ? "内心批评家声音测试常见问题" : "FSCRS Inner Critic Voice Test: frequently asked questions");
if (slug === "holding-yourself-back") return (zh ? "自我设限测试常见问题" : "Holding Yourself Back Test: frequently asked questions");
if (slug === "breakup-reflection-test") return (zh ? "分手复盘测试常见问题" : "Breakup Reflection Test: frequently asked questions");
if (slug === "conflict-styles") return (zh ? "冲突风格测试常见问题" : "Conflict Style Test: frequently asked questions");
if (slug === "communication-adaptability") return (zh ? "沟通适应性测试常见问题" : "Communication Adaptability Test: frequently asked questions");
if (slug === "self-compassion") return (zh ? "自我慈悲测试常见问题" : "Self-Compassion Test: frequently asked questions");
if (slug === "wholesome-partner") return (zh ? "健康伴侣相处测试常见问题" : "Wholesome Partner Test: frequently asked questions");
if (slug === "burnout-risk") return (zh ? "CBI倦怠测试常见问题" : "CBI Burnout Test: frequently asked questions");
if (slug === "time-management") return (zh ? "时间管理测试常见问题" : "Time Management Test: frequently asked questions");
if (slug === "self-esteem") return (zh ? "罗森伯格自尊测试常见问题" : "Rosenberg Self-Esteem Test: frequently asked questions");
if (slug === "morality-6") return (zh ? "道德基础测试（MFQ-2）常见问题" : "Moral Foundations Test (MFQ-2) frequently asked questions");
if (slug === "trust-issues-test") return (zh ? "信任问题测试常见问题" : "Trust Issues Test frequently asked questions");
if (slug === "libertarian") return (zh ? "自由意志主义测试常见问题" : "Libertarian Test frequently asked questions");
if (slug === "spatial-reasoning") return (zh ? "空间推理测试常见问题" : "Spatial Reasoning Test FAQ");
if (slug === "mechanical-reasoning") return (zh ? "机械推理测试常见问题" : "Mechanical Reasoning Test FAQ");
if (slug === "political-coordinates") return (zh ? "政治坐标测试常见问题" : "Political Coordinates Test FAQ");
if (slug === "relationship-commitment") return (zh ? "亲密关系承诺度测试常见问题" : "Relationship Commitment Test FAQ");
if (slug === "freudian-personality") return (zh ? "弗洛伊德人格测试常见问题" : "Freudian Personality Test FAQ");
if (slug === "sql-test") return (zh ? "SQL测试常见问题" : "SQL Test FAQ");
if (slug === "sales-aptitude") return (zh ? "销售能力测试常见问题" : "Sales Aptitude Test FAQ");
if (slug === "python-test") return (zh ? "Python测试常见问题" : "Python Test FAQ");
if (slug === "javascript-test") return (zh ? "JavaScript测试常见问题" : "JavaScript Test FAQ");
if (slug === "logical-reasoning") return (zh ? "逻辑与演绎推理测试常见问题" : "Logical & Deductive Reasoning Test FAQ");
if (slug === "eras-of-you-test") return (zh ? "时代的你测试常见问题" : "Eras of You Test FAQ");
if (slug === "financial-accounting") return (zh ? "财务会计测试常见问题" : "Financial Accounting Test FAQ");
if (slug === "java-test") return (zh ? "Java测试常见问题" : "Java Test FAQ");
if (slug === "found-family-role-test") return (zh ? "找到家庭角色测试常见问题" : "Found Family Role Test FAQ");
if (slug === "excel-skills") return (zh ? "Excel技能测试常见问题" : "Excel Skills Test FAQ");
if (slug === "feminine-energy") return (zh ? "女性气质能量测试常见问题" : "Feminine Energy Test FAQ");
if (slug === "computer-literacy") return (zh ? "计算机素养测试常见问题" : "Computer Literacy Test FAQ");
if (slug === "verbal-reasoning") return (zh ? "言语推理测试常见问题" : "Verbal Reasoning Test FAQ");
if (slug === "big-fish-energy-test") return (zh ? "大鱼能量测试常见问题" : "Big Fish Energy Test FAQ");
if (slug === "barbie-character") return (zh ? "芭比角色测试常见问题" : "Barbie Character Test FAQ");
if (slug === "apocalypse-survival-type-test") return (zh ? "启示录生存类型测试常见问题" : "Apocalypse Survival Type Test FAQ");
if (slug === "spanish-proficiency") return (zh ? "西班牙语水平测试常见问题" : "Spanish Proficiency Practice Test FAQ");
if (slug === "space-marine-chapter") return (zh ? "星际战士战团测试常见问题" : "Space Marine Chapter Test FAQ");
if (slug === "hundred-acre-wood-friend-quiz") return (zh ? "小熊维尼角色测试常见问题" : "Winnie the Pooh Character Quiz FAQ");
if (slug === "grammar-test") return (zh ? "英语语法测试常见问题" : "English Grammar Test FAQ");
if (slug === "anime-character-archetype-test") return (zh ? "动漫角色原型测试常见问题" : "Anime Character Archetype Quiz FAQ");
if (slug === "blue-lock") return (zh ? "蓝色监狱角色测试常见问题" : "Blue Lock Character Quiz FAQ");
if (slug === "villain-era-archetype-test") return (zh ? "反派时代原型测试常见问题" : "Villain Era Archetype Test FAQ");
if (slug === "english-proficiency") return (zh ? "英语水平测试常见问题" : "English Proficiency Practice Test FAQ");
if (slug === "gossip-girl") return (zh ? "绯闻女孩角色测试常见问题" : "Gossip Girl Character Test FAQ");
if (slug === "amazing-digital-circus") return (zh ? "神奇数字马戏团角色测试常见问题" : "Amazing Digital Circus Character Test FAQ");
if (slug === "game-of-thrones") return (zh ? "权力的游戏角色测试常见问题" : "Game of Thrones Character Test FAQ");
if (slug === "decade-aesthetic-test") return (zh ? "十年美学测试常见问题" : "Decade Aesthetic Test FAQ");
if (slug === "twilight-character") return (zh ? "《暮光之城》角色测试常见问题" : "Twilight Character Test FAQ");
if (slug === "wednesday-addams-character") return (zh ? "《星期三》角色测试常见问题" : "Wednesday Character Test FAQ");
if (slug === "stranger-things") return (zh ? "《怪奇物语》角色测试常见问题" : "Stranger Things Character Test FAQ");
if (slug === "avengers-character") return (zh ? "《复仇者联盟》角色测试常见问题" : "Avengers Character Test FAQ");
if (slug === "dexter") return (zh ? "《嗜血法医》Dexter角色测试常见问题" : "Dexter Character Test FAQ");
if (slug === "spelling-test") return (zh ? "英语拼写测试常见问题" : "English Spelling Test FAQ");
if (slug === "harry-potter-character") return (zh ? "《哈利·波特》角色测试常见问题" : "Harry Potter Character Test: frequently asked questions");
if (slug === "egen-teto") return (zh ? "Egen-Teto测试常见问题" : "Egen-Teto Test: frequently asked questions");
if (slug === "jujutsu-kaisen-character") return (zh ? "《咒术回战》角色测试常见问题" : "Jujutsu Kaisen Character Test: frequently asked questions");
if (slug === "aptitude-test") return (zh ? "能力倾向与认知能力练习常见问题" : "Aptitude and cognitive practice: frequently asked questions");
if (slug === "gilmore-girls") return (zh ? "《吉尔莫女孩》角色测试常见问题" : "Gilmore Girls Character Test: frequently asked questions");
if (slug === "south-park") return (zh ? "《南方公园》角色测试常见问题" : "South Park Character Test: frequently asked questions");
if (slug === "workplace-technology") return (zh ? "职场技术与协作测试常见问题" : "Workplace Technology Test: frequently asked questions");
if (slug === "nana-character") return (zh ? "《NANA》角色测试常见问题" : "Nana Character Test: frequently asked questions");
if (slug === "delulu-test") return (zh ? "Delulu测试常见问题" : "Delulu Test: frequently asked questions");
if (slug === "cybersecurity-awareness") return (zh ? "网络安全意识测试常见问题" : "Cyber Security Test: frequently asked questions");
if (slug === "wojak") return (zh ? "Wojak角色测试常见问题" : "Wojak Test: frequently asked questions");
if (slug === "attention-to-detail") return (zh ? "细节注意力测试常见问题" : "Attention to Detail Test: frequently asked questions");
if (slug === "my-little-pony-character-quiz") return (zh ? "小马宝莉角色测试常见问题" : "My Little Pony Character Quiz: frequently asked questions");
if (slug === "my-hero-academia-character-quiz") return (zh ? "我的英雄学院角色测试常见问题" : "My Hero Academia Character Quiz: frequently asked questions");
if (slug === "hazbin-hotel-character-quiz") return (zh ? "地狱客栈角色测试常见问题" : "Hazbin Hotel Character Quiz: frequently asked questions");
if (slug === "ginny-and-georgia-character-quiz") return (zh ? "金妮与乔治娅角色测试常见问题" : "Ginny & Georgia Character Quiz: frequently asked questions");
if (slug === "next-life") return (zh ? "来世之路测试常见问题" : "Next Life Quiz: frequently asked questions");
if (slug === "dark-triad") return (zh ? "黑暗三角测试常见问题" : "Dark Triad Test: frequently asked questions");
if (slug === "moral-dilemma-test") return (zh ? "道德困境测试常见问题" : "Moral Dilemma Test: frequently asked questions");
if (slug === "egogram") return (zh ? "自我状态图测试常见问题" : "Egogram Test: frequently asked questions");
if (slug === "social-intelligence-test") return (zh ? "社交智能测试常见问题" : "Social Intelligence Test: frequently asked questions");
if (slug === "male-archetype-test") return (zh ? "男性原型测试常见问题" : "Male Archetype Test: frequently asked questions");
if (slug === "ikigai") return (zh ? "Ikigai生之目的测试常见问题" : "Ikigai Test: frequently asked questions");
if (slug === "grit-test") return (zh ? "毅力测试常见问题" : "Grit Test: frequently asked questions");
if (slug === "toxic-trait") return (zh ? "有毒特征测试常见问题" : "Toxic Trait Test: frequently asked questions");
if (slug === "intelligence-type-test") return (zh ? "智能类型测试常见问题" : "Intelligence Type Test: frequently asked questions");
if (slug === "locus-of-control") return (zh ? "控制点测试常见问题" : "Locus of Control Test: frequently asked questions");
if (slug === "growth-mindset-fixed-mindset") return (zh ? "成长型与固定型思维测试常见问题" : "Growth and Fixed Mindset Test: frequently asked questions");
if (slug === "maturity-test") return (zh ? "成熟度测试常见问题" : "Maturity Test: frequently asked questions");
if (slug === "arabic-personality-compass") return (zh ? "性格罗盘测试常见问题" : "Personality compass: frequently asked questions");
if (slug === "inkblot-personality-quiz") return (zh ? "墨迹人格测验常见问题" : "Inkblot quiz: frequently asked questions");
if (slug === "philosopher-personality-test") return (zh ? "哲学家性格测试常见问题" : "Philosopher quiz: frequently asked questions");
if (slug === "inner-child-personality-test") return (zh ? "内在童年性格测试常见问题" : "Inner Child Personality Test: frequently asked questions");
if (slug === "light-triad-test") return (zh ? "光明三元素测试常见问题" : "Light Triad Test: frequently asked questions");
if (slug === "values") return (zh ? "Schwartz价值观测试常见问题" : "Schwartz Values Test: frequently asked questions");
if (slug === "optimism-pessimism") return (zh ? "乐观与悲观性测试常见问题" : "Optimism and Pessimism Test: frequently asked questions");
if (slug === "socionics") return (zh ? "Socionics测试常见问题" : "Socionics Test: frequently asked questions");
if (slug === "sdt-motivation") return (zh ? "SDT动机测试常见问题" : "SDT Motivation Test: frequently asked questions");
if (slug === "type-ab") return (zh ? "A型/B型人格测试常见问题" : "Type A / Type B Test: frequently asked questions");
if (slug === "dungeons-dragons-class") return (zh ? "D&D职业测试常见问题" : "D&D Class Quiz: frequently asked questions");
if (slug === "hello-kitty") return (zh ? "Hello Kitty角色测试常见问题" : "Hello Kitty Character Quiz: frequently asked questions");
if (slug === "star-wars-character") return (zh ? "星球大战角色测试常见问题" : "Star Wars Character Quiz: frequently asked questions");
if (slug === "bleach") return (zh ? "死神角色测试常见问题" : "BLEACH Character Quiz: frequently asked questions");
if (slug === "death-note") return (zh ? "死亡笔记角色测试常见问题" : "Death Note Character Quiz: frequently asked questions");
if (slug === "naruto-character") return (zh ? "火影忍者角色测试常见问题" : "Naruto Character Quiz: frequently asked questions");
if (slug === "disney-princess") return (zh ? "迪士尼公主测试常见问题" : "Disney Princess Quiz: frequently asked questions");
if (slug === "chiikawa") return (zh ? "吉伊卡哇角色测试常见问题" : "Chiikawa Character Quiz: frequently asked questions");
if (slug === "bojack-horseman-character-quiz") return (zh ? "马男波杰克角色测试常见问题" : "BoJack Horseman Character Quiz: frequently asked questions");
if (slug === "moon-phase") return (zh ? "月相测试常见问题" : "Moon Phase Test: frequently asked questions");
if (slug === "past-life") return (zh ? "前世测试常见问题" : "Past Life Quiz: frequently asked questions");
if (slug === "aura-color") return (zh ? "光环颜色测试常见问题" : "Aura Color Test: frequently asked questions");
if (slug === "what-element-am-i") return (zh ? "四元素测试常见问题" : "Four-Element Quiz: frequently asked questions");
if (slug === "which-tarot-card-are-you") return (zh ? "塔罗牌测试常见问题" : "Tarot Card Quiz: frequently asked questions");
if (slug === "greek-god") return (zh ? "希腊神测试常见问题" : "Greek God Quiz: frequently asked questions");
if (slug === "hogwarts-house-quiz") return (zh ? "霍格沃茨分院测试常见问题" : "Hogwarts House Quiz: frequently asked questions");
if (slug === "tsundere-dere-type") return (zh ? "傲娇类型测试常见问题" : "Dere Type Quiz: frequently asked questions");
if (slug === "character-strengths") return (zh ? "性格优势测试常见问题" : "Character Strengths Test: frequently asked questions");
if (slug === "learning-style") return (zh ? "学习风格测试常见问题" : "Learning Style Test: frequently asked questions");
if (slug === "procrastinator-type-test") return (zh ? "拖延者类型测试常见问题" : "Procrastination Patterns Test: frequently asked questions");
if (slug === "likable-person-test") return (zh ? "讨人喜欢测试常见问题" : "Likable Person Test: frequently asked questions");
if (slug === "difficult-person-test") return (zh ? "难相处人格测试常见问题" : "Difficult Person Test: frequently asked questions");
if (slug === "people-pleaser") return (zh ? "讨好型人格测试常见问题" : "People Pleaser Test: frequently asked questions");
if (slug === "music-taste-test") return (zh ? "音乐品味测试常见问题" : "Music Taste Test: frequently asked questions");
if (slug === "aesthetic-core-test") return (zh ? "美学核心测试常见问题" : "Aesthetic quiz: frequently asked questions");
if (slug === "travel-personality-test") return (zh ? "旅行性格测试常见问题" : "Travel Personality Test: frequently asked questions");
if (slug === "humor-style-test") return (zh ? "幽默风格测试常见问题" : "Humor Style Test: frequently asked questions");
if (slug === "leadership-style") return (zh ? "领导风格测试常见问题" : "Leadership Style Test: frequently asked questions");
if (slug === "communication-style") return (zh ? "沟通风格测试常见问题" : "Communication Style Test: frequently asked questions");
if (slug === "attachment-styles") return (zh ? "依恋风格测试常见问题" : "Attachment Style Quiz: frequently asked questions");
if (slug === "love-languages") return (zh ? "五种爱的语言测试常见问题" : "Love Language Test: frequently asked questions");
if (slug === "temperament") return (zh ? "气质测试常见问题" : "Four Temperaments Test: frequently asked questions");
if (slug === "introvert-extrovert") return (zh ? "内向外向测试常见问题" : "Introvert or Extrovert Test: frequently asked questions");
if (slug === "jungian-archetype") return (zh ? "荣格原型测试常见问题" : "Jungian Archetype Test: frequently asked questions");
return (zh ? "关于这项测试" : "Questions about this test");
})()}</h2>{[...quiz.faq, ...(gapEditorial?.faq ?? []),
    ...(slug === "problem-solving-critical-thinking" ? problemSolvingLandingFaq : []),
    ...(slug === "word-skills" ? wordSkillsLandingFaq : []),
    ...(slug === "project-management" ? projectManagementLandingFaq : []),
    ...(slug === "rizz-test" ? rizzLandingFaq : []),
    ...(slug === "personal-finance-literacy" ? personalFinanceLandingFaq : []),
    ...(slug === "ai-literacy" ? aiLiteracyLandingFaq : []),
    ...(slug === "chinese-zodiac" ? chineseZodiacLandingFaq : []),
    ...(slug === "customer-service-aptitude" ? customerServiceLandingFaq : []),
    ...(slug === "german-proficiency" ? germanLandingFaq : []),
    ...(slug === "zodiac-sign-quiz" ? zodiacStoryLandingFaq : []),
    ...(slug === "love-personality" ? lovePersonalityLandingFaq : []),
    ...(slug === "situational-judgement" ? situationalJudgementLandingFaq : []),
    ...(slug === "8-values-political" ? eightValuesLandingFaq : []),
    ...(slug === "relationship-values" ? relationshipValuesLandingFaq : []),
    ...(slug === "hexaco" ? hexacoLandingFaq : []),
    ...(slug === "relationship-preferences" ? relationshipPreferencesLandingFaq : []),
    ...(slug === "abstract-reasoning" ? abstractReasoningLandingFaq : []),
    ...(slug === "conservatism" ? conservatismLandingFaq : []),
    ...(slug === "numerical-reasoning" ? numericalReasoningLandingFaq : []),
    ...(slug === "digital-ethics-citizenship" ? digitalCitizenshipLandingFaq : []),
    ...(slug === "adult-age-preferences" ? adultAgePreferencesLandingFaq : []),
    ...(slug === "freudian-personality" ? freudianLandingFaq : []),
    ...(slug === "relationship-commitment" ? commitmentLandingFaq : []),
    ...(slug === "toxic-positivity-test" ? positivePressureLandingFaq : []),
    ...(slug === "friendship-compatibility" ? friendshipFitLandingFaq : []),
    ...(slug === "perfectionism" ? sapsLandingFaq : []),
    ...(slug === "apology-language" ? apologyLandingFaq : []),
    ...(slug === "mote-type" ? moteLandingFaq : []),
    ...(slug === "jealousy-scale" ? jealousyLandingFaq : []),
    ...(slug === "sternberg-love" ? sternbergLandingFaq : []),
    ...(slug === "annoying-person-test" ? annoyingLandingFaq : []),
    ...(slug === "love-fight-style" ? lovefightLandingFaq : []),
    ...(slug === "capacity-to-love-test" ? ctlLandingFaq : []),
    ...(slug === "executive-function" ? adexiLandingFaq : []),
    ...(slug === "hsp-sensitivity-quiz" ? hspLandingFaq : []),
    ...(slug === "competency-test" ? competencyLandingFaq : []),
    ...(slug === "sensory-processing-test" ? spqLandingFaq : []),
    ...(slug === "parenting-style" ? parentingLandingFaq : []),
    ...(slug === "inner-critic-voice-test" ? fscrsLandingFaq : []),
    ...(slug === "holding-yourself-back" ? holdingLandingFaq : []),
    ...(slug === "conflict-boundary-behaviors-test" ? conflictBoundaryLandingFaq : []),
    ...(slug === "stress-check-in-test" ? monthlyStressLandingFaq : []),
    ...(slug === "sake-type" ? sakeTypeLandingFaq : []),
    ...(slug === "love-type-16" ? loveCombinationsLandingFaq : []),
    ...(slug === "food-disgust" ? foodDisgustLandingFaq : []),
    ...(slug === "energy-flow" ? energyRhythmLandingFaq : []),
    ...(slug === "cyberpunk-edgerunners" ? edgerunnersLandingFaq : []),
    ...(slug === "mental-age" ? playfulAgeLandingFaq : []),
    ...(slug === "stupidity-test" ? everydayMixupsLandingFaq : []),
    ...(slug === "tech-savvy" ? techConfidenceLandingFaq : []),
    ...(slug === "orientation-exploration-test" ? orientationLandingFaq : []),
    ...(slug === "four-axes-test" ? fourAxesLandingFaq : []),
    ...(slug === "seven-sins-virtues-test" ? virtuesLandingFaq : []),
    ...(slug === "euphoria-character-quiz" ? euphoriaLandingFaq : []),
    ...(slug === "stress-response-patterns-test" ? stressResponseLandingFaq : []),
    ...(slug === "remote-work" ? remoteWorkLandingFaq : []),
    ...(slug === "freelance-ready" ? freelanceReadyLandingFaq : []),
    ...(slug === "coping-rhythm-test" ? copingRhythmLandingFaq : []),
    ...(slug === "habit-patterns-test" ? habitPatternsLandingFaq : []),
    ...(slug === "intimacy-preference-test" ? intimacyLandingFaq : []),
    ...(slug === "breakup-reflection-test" ? breakupLandingFaq : []),
    ...(slug === "conflict-styles" ? conflictStylesLandingFaq : []),
    ...(slug === "communication-adaptability" ? communicationAdaptabilityLandingFaq : []),
    ...(slug === "self-compassion" ? scs26LandingFaq : []),
    ...(slug === "wholesome-partner" ? wholesomePartnerLandingFaq : []),
    ...(slug === "burnout-risk" ? cbiLandingFaq : []),
    ...(slug === "time-management" ? timeManagementLandingFaq : []),
    ...(slug === "self-esteem" ? selfEsteemLandingFaq : []),
    ...(slug === "morality-6" ? mfq2LandingFaq : []),
    ...(slug === "trust-issues-test" ? trustLandingFaq : []),
    ...(slug === "libertarian" ? libertyLandingFaq : []),
    ...(slug === "spatial-reasoning" ? spatialReasoningLandingFaq : []),
    ...(slug === "mechanical-reasoning" ? mechanicalReasoningLandingFaq : []),
    ...(slug === "political-coordinates" ? politicalCoordinatesLandingFaq : []),
    ...(slug === "sql-test" ? sqlLandingFaq : []),
    ...(slug === "color-season" ? colorSeasonLandingFaq : []),
    ...(slug === "sales-aptitude" ? salesAptitudeLandingFaq : []),
    ...(slug === "python-test" ? pythonLandingFaq : []),
    ...(slug === "javascript-test" ? javaScriptLandingFaq : []),
    ...(slug === "logical-reasoning" ? logicalReasoningLandingFaq : []),
    ...(slug === "eras-of-you-test" ? erasOfYouLandingFaq : []),
    ...(slug === "financial-accounting" ? financialAccountingLandingFaq : []),
    ...(slug === "java-test" ? javaLandingFaq : []),
    ...(slug === "found-family-role-test" ? foundFamilyRoleLandingFaq : []),
    ...(slug === "excel-skills" ? excelSkillsLandingFaq : []),
    ...(slug === "feminine-energy" ? feminineEnergyLandingFaq : []),
    ...(slug === "computer-literacy" ? computerLiteracyLandingFaq : []),
    ...(slug === "verbal-reasoning" ? verbalReasoningLandingFaq : []),
    ...(slug === "big-fish-energy-test" ? bigFishLandingFaq : []),
    ...(slug === "barbie-character" ? barbieLandingFaq : []),
    ...(slug === "apocalypse-survival-type-test" ? apocalypseLandingFaq : []),
    ...(slug === "spanish-proficiency" ? spanishProficiencyLandingFaq : []),
    ...(slug === "space-marine-chapter" ? spaceMarineChaptersLandingFaq : []),
    ...(slug === "hundred-acre-wood-friend-quiz" ? storybookFriendsLandingFaq : []),
    ...(slug === "grammar-test" ? grammarLandingFaq : []),
    ...(slug === "anime-character-archetype-test" ? animeStoryRolesLandingFaq : []),
    ...(slug === "blue-lock" ? blueLockLandingFaq : []),
    ...(slug === "villain-era-archetype-test" ? villainEraLandingFaq : []),
    ...(slug === "english-proficiency" ? englishProficiencyLandingFaq : []),
    ...(slug === "gossip-girl" ? gossipGirlLandingFaq : []),
    ...(slug === "amazing-digital-circus" ? digitalCircusLandingFaq : []),
    ...(slug === "game-of-thrones" ? gameOfThronesLandingFaq : []),
    ...(slug === "decade-aesthetic-test" ? decadeLandingFaq : []),
    ...(slug === "twilight-character" ? twilightLandingFaq : []),
    ...(slug === "wednesday-addams-character" ? wednesdayLandingFaq : []),
    ...(slug === "stranger-things" ? strangerThingsLandingFaq : []),
    ...(slug === "avengers-character" ? avengersLandingFaq : []),
    ...(slug === "dexter" ? dexterLandingFaq : []),
    ...(slug === "spelling-test" ? spellingLandingFaq : []), ...(slug === "harry-potter-character" ? harryPotterLandingFaq : []), ...(slug === "egen-teto" ? egenTetoLandingFaq : []), ...(slug === "jujutsu-kaisen-character" ? jujutsuKaisenLandingFaq : []), ...(slug === "aptitude-test" ? aptitudeLandingFaq : []), ...(slug === "gilmore-girls" ? gilmoreGirlsLandingFaq : []), ...(slug === "south-park" ? southParkLandingFaq : []), ...(slug === "workplace-technology" ? workplaceTechnologyLandingFaq : []), ...(slug === "nana-character" ? nanaLandingFaq : []), ...(slug === "delulu-test" ? deluluLandingFaq : []), ...(slug === "cybersecurity-awareness" ? cybersecurityLandingFaq : []), ...(slug === "wojak" ? wojakLandingFaq : []), ...(slug === "attention-to-detail" ? attentionDetailLandingFaq : []), ...(slug === "my-little-pony-character-quiz" ? myLittlePonyLandingFaq : []), ...(slug === "my-hero-academia-character-quiz" ? myHeroAcademiaLandingFaq : []), ...(slug === "hazbin-hotel-character-quiz" ? hazbinHotelLandingFaq : []), ...(slug === "ginny-and-georgia-character-quiz" ? ginnyGeorgiaLandingFaq : []), ...(slug === "next-life" ? nextLifeLandingFaq : []), ...(slug === "dark-triad" ? darkTriadLandingFaq : []), ...(slug === "moral-dilemma-test" ? moralDilemmaLandingFaq : []), ...(slug === "egogram" ? egogramLandingFaq : []), ...(slug === "social-intelligence-test" ? socialIntelligenceLandingFaq : []), ...(slug === "male-archetype-test" ? maleRoleLandingFaq : []), ...(slug === "ikigai" ? ikigaiLandingFaq : []), ...(slug === "grit-test" ? gritLandingFaq : []), ...(slug === "toxic-trait" ? habitsLandingFaq : []), ...(slug === "intelligence-type-test" ? thinkingApproachLandingFaq : []), ...(slug === "locus-of-control" ? locusLandingFaq : []), ...(slug === "everyday-control-style" ? controlLandingFaq : []), ...(slug === "interpersonal-preferences" ? interpersonalLandingFaq : []), ...(slug === "social-attitudes-reflection" ? socialAttitudesLandingFaq : []), ...(slug === "attraction-experiences" ? attractionLandingFaq : []), ...(slug === "dark-tetrad-sd4" ? sd4LandingFaq : []), ...(slug === "work-traits-reflection" ? workTraitsLandingFaq : []), ...(slug === "relationship-worry-habits" ? relationshipWorryLandingFaq : []), ...(slug === "face-self-image" ? faceSelfImageLandingFaq : []), ...(slug === "work-role-reflection" ? workRoleLandingFaq : []), ...(slug === "dating-outlook" ? datingOutlookLandingFaq : []), ...(slug === "relationship-habits" ? relationshipHabitsLandingFaq : []), ...(slug === "intimacy-values" ? intimacyValuesLandingFaq : []), ...(slug === "work-activity-interests" ? workActivityLandingFaq : []), ...(slug === "tipi-10" ? tipi10LandingFaq : []), ...(slug === "growth-mindset-fixed-mindset" ? growthLandingFaq : []), ...(slug === "maturity-test" ? maturityLandingFaq : []), ...(slug === "arabic-personality-compass" ? compassLandingFaq : []), ...(slug === "inkblot-personality-quiz" ? inkblotLandingFaq : []), ...(slug === "philosopher-personality-test" ? philosopherLandingFaq : [])].map((faq, index) => <section key={index}><h3 className="text-lg font-semibold">{faq.question[locale]}</h3><p className="mt-2">{renderCopy(faq.answer[locale])}</p></section>)}</section>
    {quiz.slug === "character-strengths" && <QuestionnaireCharacterSource locale={locale} />}
    {(quiz.kind !== "work-role12" || slug === "work-role-reflection") && (quiz.kind !== "love-type16" || slug === "love-type-16") && (quiz.kind !== "mini-orientation" || slug === "orientation-exploration-test") && (quiz.kind !== "mini-conflict" || slug === "conflict-boundary-behaviors-test") && (quiz.kind !== "stress-reflection4" || slug === "stress-check-in-test") && quiz.kind !== "pss4" && (quiz.kind !== "four-axes" || slug === "four-axes-test") && (quiz.kind !== "mini-shadow" || slug === "stress-response-patterns-test") && (quiz.kind !== "preparation-actions20" || slug === "freelance-ready" || slug === "remote-work") && (quiz.kind !== "tipi10" || slug === "tipi-10") && quiz.kind !== "ptq15" && <section className="explore-reading-library" aria-labelledby="questionnaire-reading-scope"><h2 id="questionnaire-reading-scope">{(() => {
if (slug === "attraction-experiences") return (zh ? "深入阅读：吸引体验、比较依据与结果解释" : "Reading in depth: attraction, comparison and interpretation");
if (slug === "dark-tetrad-sd4") return (zh ? "深入阅读：SD4题意、研究依据与结果解释" : "Reading in depth: SD4 content, research and interpretation");
if (slug === "work-traits-reflection") return (zh ? "深入阅读：工作行为、情境机会与结果解释" : "Reading in depth: work behaviors, opportunities and interpretation");
if (slug === "relationship-worry-habits") return (zh ? "深入阅读：关系反应、明确意图与原始频率" : "Reading in depth: responses, stated intentions and raw frequency");
if (slug === "face-self-image") return (zh ? "深入阅读：自我形象、频率解释与研究范围" : "Reading in depth: self-image, frequency and research scope");
if (slug === "work-role-reflection") return (zh ? "深入阅读：任务实例、参与情境与支持安排" : "Reading in depth: task instances, participation and support");
if (slug === "relationship-habits") return (zh ? "深入阅读：四类习惯、原始频率与具体观察" : "Reading in depth: four habits, raw frequencies and concrete observations");
if (slug === "intimacy-values") return (zh ? "深入阅读：五项重要程度、边界与结果读法" : "Reading in depth: five priorities, boundaries and interpretation");
if (slug === "work-activity-interests") return (zh ? "深入阅读：六类任务、均分解释与兴趣探索" : "Reading in depth: six task areas, means and interest exploration");
if (slug === "tipi-10") return (zh ? "深入阅读：配对计分、五维解释与研究证据" : "Reading in depth: paired scoring, five domains and research evidence");
if (slug === "cyberpunk-edgerunners") return (zh ? "深入阅读：人物角度、计数算例与同人范围" : "Reading in depth: character angles, count examples and fan-edition scope");
if (slug === "love-type-16") return (zh ? "深入阅读：四轴含义、组合算例与研究范围" : "Reading in depth: four axes, worked combinations and research scope");
if (slug === "food-disgust") return (zh ? "深入阅读：八个领域、均值算例与版本证据" : "Reading in depth: eight domains, worked means and edition evidence");
if (slug === "energy-flow") return (zh ? "深入阅读：主题区别、研究与实际观察" : "Reading in depth: topic distinctions, research and practical observations");
if (slug === "mental-age") return (zh ? "深入阅读：偏好细节、主观年龄与使用范围" : "Reading in depth: preference details, subjective age and scope");
if (slug === "stupidity-test") return (zh ? "深入阅读：六类区别、计数实例与人因背景" : "Reading in depth: six outcomes, worked counts and human-factors background");
if (slug === "tech-savvy") return (zh ? "深入阅读：六种任务、研究范围与实际应用" : "Reading in depth: six tasks, research scope and practical use");
if (slug === "orientation-exploration-test") return (zh ? "完整读法：逐主题实例、记录算例与科学范围" : "Reading in depth: topic examples, response records and scientific scope");
if (slug === "sake-type") return (zh ? "完整读法：四意象区别、算例与游戏用途" : "Reading in depth: four images, worked counts and the purpose of the game");
if (slug === "stress-check-in-test") return (zh ? "完整读法：月度回顾、计算实例与测量研究" : "Reading in depth: monthly recall, worked examples and measurement research");
if (slug === "conflict-boundary-behaviors-test") return (zh ? "完整读法：具体行动、计算实例与证据范围" : "Reading in depth: specific actions, worked calculations and evidence");
if (slug === "four-axes-test") return (zh ? "四轴完整读法：情境实例、计算与证据范围" : "Four axes in depth: examples, calculations and evidence");
if (slug === "seven-sins-virtues-test") return (zh ? "七宗罪与七美德完整读法：文化背景、研究区别与七组解释" : "Sins and virtues in depth: cultural context, research and seven readings");
if (slug === "euphoria-character-quiz") return (zh ? "《亢奋》结果完整读法：路线比较、情境实例与证据范围" : "Euphoria results in depth: route comparisons, examples and evidence");
if (slug === "stress-response-patterns-test") return (zh ? "压力反应完整读法：研究区别、实例与自报边界" : "Stress responses in depth: research distinctions and practical examples");
if (slug === "remote-work") return (zh ? "远程工作准备完整读法：研究证据与实践情境" : "Remote-work preparation in depth: research and practical situations");
if (slug === "freelance-ready") return (zh ? "自由职业准备完整读法：框架、实例与行动记录" : "Freelance preparation in depth: framework, examples and action records");
if (slug === "coping-rhythm-test") return (zh ? "应对节奏完整读法：研究、情境与选择实例" : "Coping rhythm in depth: research, context and practical examples");
if (slug === "habit-patterns-test") return (zh ? "习惯模式完整读法：研究概念、算例与私人观察" : "Habit patterns in depth: research, arithmetic and private observation");
if (slug === "intimacy-preference-test") return (zh ? "亲密偏好完整读法：研究、算例与具体协商" : "Intimacy preferences in depth: research, examples and negotiation");
if (slug === "disc") return (zh ? "DISC结果读法、研究证据与使用范围" : "Reading DISC results: research evidence and scope");
if (slug === "color-season") return (zh ? "配色偏好阅读指南：颜色、计数与研究范围" : "Palette preference reading guide: colours, counts and research scope");
if (slug === "problem-solving-critical-thinking") return (zh ? "问题解决与批判性思维：概念、方法与研究背景" : "Problem solving and critical thinking: concepts, methods and research context");
if (slug === "word-skills") return (zh ? "Word操作知识：适用条件、官方依据与练习方法" : "Word knowledge: conditions, official references and practice methods");
if (slug === "project-management") return (zh ? "项目管理知识：推理条件、方法依据与应用" : "Project management knowledge: reasoning conditions, sources and application");
if (slug === "rizz-test") return (zh ? "Rizz结果读法：具体情境、研究证据与自主选择" : "Reading Rizz results: situations, research evidence and your choices");
if (slug === "personal-finance-literacy") return (zh ? "个人理财知识读法：算例、证据与完整复习" : "Understanding personal finance: worked examples, evidence and full revision");
if (slug === "ai-literacy") return (zh ? "AI素养知识读法：概念、算例、研究与完整复习" : "Understanding AI literacy: concepts, examples, research and full revision");
if (slug === "chinese-zodiac") return (zh ? "十二生肖测试读法：文化背景、计数算例与完整探索" : "Reading the Chinese Zodiac Quiz: culture, counting and full exploration");
if (slug === "customer-service-aptitude") return (zh ? "客服情境读法：沟通、规则、记录与完整复习" : "Understanding service scenarios: communication, rules, records and full revision");
if (slug === "german-proficiency") return (zh ? "德语书面练习读法：语法依据、原文证据与完整复习" : "Understanding written German: grammar, textual evidence and full revision");
if (slug === "zodiac-sign-quiz") return (zh ? "星座测试读法：故事比较、计数算例与科学边界" : "Reading the Zodiac Sign Quiz: stories, worked counts and evidence");
if (slug === "love-personality") return (zh ? "恋爱人格测试读法：互动例子、计数与关系研究" : "Reading the Love Personality Test: interaction examples, counts and relationship research");
if (slug === "situational-judgement") return (zh ? "情境判断练习读法：条件推理、计分算例与研究区别" : "Understanding situational practice: conditional reasoning, counts and research distinctions");
if (slug === "8-values-political") return (zh ? "8 Values结果读法：四轴含义、计分实例与研究范围" : "Reading 8 Values: axis meanings, worked scoring and evidence");
if (slug === "relationship-values") return (zh ? "关系价值结果读法：概念、研究与具体讨论" : "Reading relationship values: concepts, evidence and concrete discussion");
if (slug === "hexaco") return (zh ? "HEXACO结果读法：领域、研究与具体观察" : "Reading HEXACO: domains, evidence and concrete reflection");
if (slug === "relationship-preferences") return (zh ? "关系安排偏好读法：情境、研究与具体提议" : "Reading relationship preferences: context, evidence and concrete proposals");
if (slug === "abstract-reasoning") return (zh ? "抽象推理方法与研究：规则、例题及复习策略" : "Abstract reasoning methods and evidence: rules, examples and review");
if (slug === "conservatism") return (zh ? "SECS阅读与研究：温度、计算示例及历史语境" : "Reading SECS: warmth, worked calculations and historical context");
if (slug === "numerical-reasoning") return (zh ? "数值推理方法与研究：基数、权重、单位及复习" : "Numerical reasoning methods and evidence: bases, weights, units and review");
if (slug === "digital-ethics-citizenship") return (zh ? "数字公民意识方法与研究：证据、规则及实际情境" : "Digital citizenship methods and evidence: facts, rules and context");
if (slug === "adult-age-preferences") return (zh ? "年龄情境与关系期待：方法、研究与具体协商" : "Age contexts and relationship expectations: methods, research and discussion");
if (slug === "toxic-positivity-test") return (zh ? "积极压力完整读法：解释、情境与研究证据" : "Positive pressure: interpretation, context and research evidence");
if (slug === "friendship-compatibility") return (zh ? "友谊完整读法：约定、差异与研究证据" : "Reading friendship: agreements, differences and research evidence");
if (slug === "perfectionism") return (zh ? "SAPS完整读法：期待、自我评价与研究证据" : "Reading SAPS: expectations, self-evaluation and research evidence");
if (slug === "apology-language") return (zh ? "道歉偏好完整读法：情境、研究与实际应用" : "Apology preferences: situations, research and practical use");
if (slug === "mote-type") return (zh ? "互动选择完整读法：情境、研究与解释" : "Interaction choices: situations, research and interpretation");
if (slug === "jealousy-scale") return (zh ? "嫉妒反思完整读法：情境、研究与解释" : "Jealousy reflection: context, research and careful interpretation");
if (slug === "sternberg-love") return (zh ? "爱的三角完整读法：概念、证据与实际应用" : "Love-triangle reflection: concepts, evidence and practical use");
if (slug === "annoying-person-test") return (zh ? "互动反思完整读法：情境、证据与实际应用" : "Interaction reflection: examples, evidence and practical use");
if (slug === "love-fight-style") return (zh ? "冲突过程完整读法：情境、研究与实际应用" : "Conflict-process reflection: context, research and practical use");
if (slug === "capacity-to-love-test") return (zh ? "CTL-I完整读法：题文背景、研究与改编" : "CTL-I reading: item context, research and adaptation");
if (slug === "executive-function") return (zh ? "ADEXI完整读法：实际例子、来源与研究证据" : "Reading ADEXI: practical examples, sources and evidence");
if (slug === "hsp-sensitivity-quiz") return (zh ? "敏感体验完整读法：实际例子、证据与版本区别" : "Reading sensitivity experiences: examples, evidence and versions");
if (slug === "competency-test") return (zh ? "工作行为完整读法：情境、研究与实际例子" : "Work-behavior reflection: context, research and practical examples");
if (slug === "sensory-processing-test") return (zh ? "完整SPQ读法：版本、研究证据与实际例子" : "Reading the full SPQ: editions, evidence and practical examples");
if (slug === "parenting-style") return (zh ? "养育反思完整读法：具体行为、研究与共同照料" : "Parenting reflection in depth: practices, research and shared care");
if (slug === "inner-critic-voice-test") return (zh ? "FSCRS完整读法：版本、证据、算例与支持" : "FSCRS in depth: versions, evidence, examples and support");
if (slug === "holding-yourself-back") return (zh ? "七主题完整读法：情境、计分与研究证据" : "Read the seven topics in depth: context, scoring and evidence");
if (slug === "breakup-reflection-test") return (zh ? "深入理解分手复盘：具体算例、研究与结果读法" : "Breakup reflection in depth: examples, research and interpretation");
if (slug === "conflict-styles") return (zh ? "冲突风格完整读法：行动、情境与研究证据" : "Reading conflict styles: actions, context and evidence");
if (slug === "communication-adaptability") return (zh ? "沟通练习完整读法：情境、判断依据与证据" : "Communication practice: context, reasoning and evidence");
if (slug === "self-compassion") return (zh ? "SCS结果完整读法：体验、计分与研究" : "Reading SCS results: experiences, scoring and research");
if (slug === "wholesome-partner") return (zh ? "相处行为的完整读法：情境、计分与研究证据" : "Understanding relationship behaviors: examples, scoring and evidence");
if (slug === "burnout-risk") return (zh ? "CBI结果读法：模块范围、算例、研究与支持" : "Reading CBI: module scope, examples, evidence and support");
if (slug === "time-management") return (zh ? "时间管理结果读法：行为、情境、算术与研究" : "Time-management results: habits, examples, arithmetic and research");
if (slug === "self-esteem") return (zh ? "RSES结果读法：计分、算例、研究与语言" : "Read your RSES result: scoring, examples, research and language");
if (slug === "morality-6") return (zh ? "MFQ-2阅读指南：基础含义、算例、研究与翻译" : "Reading MFQ-2: foundation meanings, examples, research and translation");
if (slug === "trust-issues-test") return (zh ? "信任行为阅读指南：情境、算例与研究依据" : "Everyday trust reading guide: situations, examples and research");
if (slug === "libertarian") return (zh ? "自由原则反思：论证、算例、研究与完整读法" : "Principles Reflection: arguments, examples, evidence and full reading guides");
if (slug === "spatial-reasoning") return (zh ? "空间推理学习指南：坐标、操作、研究与复习" : "Spatial reasoning study guide: coordinates, operations, research and revision");
if (slug === "mechanical-reasoning") return (zh ? "机械推理学习指南：模型、核算与成绩读法" : "Mechanical reasoning study guide: models, checks and result interpretation");
if (slug === "political-coordinates") return (zh ? "政治坐标读法：概念、研究方法与完整比较" : "Reading political coordinates: concepts, research methods and full comparisons");
if (slug === "relationship-commitment") return (zh ? "关系承诺与投资模型：研究、计分和具体阅读" : "Commitment and the investment model: research, scoring and readings");
if (slug === "freudian-personality") return (zh ? "历史词汇与近期行为：研究证据和完整读法" : "Historical vocabulary and recent behavior: evidence and complete readings");
if (slug === "sql-test") return (zh ? "SQL阅读指南：NULL、结果粒度与查询阶段" : "SQL reading guide: NULL, result grain and query stages");
if (slug === "sales-aptitude") return (zh ? "销售练习阅读指南：判断条件、证据与计量口径" : "Sales practice reading guide: criteria, evidence and numerical definitions");
if (slug === "python-test") return (zh ? "Python阅读指南：语义、对象关系与执行路径" : "Python reading guide: semantics, object relationships and execution paths");
if (slug === "javascript-test") return (zh ? "JavaScript阅读指南：语义、执行轨迹与核验方法" : "JavaScript reading guide: semantics, execution traces and verification");
if (slug === "logical-reasoning") return (zh ? "逻辑推理阅读指南：规则、反例与证据范围" : "Logical reasoning reading guide: rules, countermodels and evidence scope");
if (slug === "eras-of-you-test") return (zh ? "时代的你阅读指南：日常做法、均分与研究范围" : "Eras of You reading guide: practices, means and research scope");
if (slug === "financial-accounting") return (zh ? "财务会计阅读指南：分录、报表、时间与计算" : "Financial accounting reading guide: entries, statements, timing and calculations");
if (slug === "java-test") return (zh ? "Java代码阅读指南：规则、例子与核验方法" : "Java code-reading guide: rules, examples and verification");
if (slug === "found-family-role-test") return (zh ? "朋友圈贡献阅读指南：场景、比较与自愿选择" : "Friend-group contribution guide: scenes, comparisons and voluntary choices");
if (slug === "excel-skills") return (zh ? "Excel学习与结果阅读：规则、算例和操作核对" : "Excel learning and result reading: rules, worked examples and operation checks");
if (slug === "feminine-energy") return (zh ? "女性气质与表达观察：概念、计分和结果使用" : "Feminine energy and expression observations: concepts, scoring and use");
if (slug === "computer-literacy") return (zh ? "计算机基础学习指南：操作依据、例子与结果核对" : "Computer basics study guide: operations, examples and checking results");
if (slug === "verbal-reasoning") return (zh ? "言语推理学习指南：例子、证据与复盘方法" : "Verbal reasoning study guide: examples, evidence and review");
if (slug === "big-fish-energy-test") return (zh ? "大鱼能量结果读法：具体比较、动物背景与证据" : "Reading Big Fish Energy: concrete comparisons, animal context and evidence");
if (slug === "barbie-character") return (zh ? "芭比角色读法：人物范围、具体比较与证据" : "Reading Barbie characters: roster, comparisons and evidence");
if (slug === "apocalypse-survival-type-test") return (zh ? "虚构角色读法：具体比较、计数、证据与创作" : "Reading fictional roles: comparisons, counts, evidence and creation");
if (slug === "spanish-proficiency") return (zh ? "西语练习方法：语言实例、阅读依据与等级框架" : "Spanish practice methods: language examples, text evidence and level frameworks");
if (slug === "space-marine-chapter") return (zh ? "战团测试读法：模型实例、计分与证据范围" : "Reading Chapter results: model examples, counts and evidence");
if (slug === "hundred-acre-wood-friend-quiz") return (zh ? "故事书朋友读法：角色比较、活动实例与证据范围" : "Reading storybook friends: character comparisons, activities and evidence");
if (slug === "grammar-test") return (zh ? "英语语法复习：规则、原创例句与结果读法" : "English grammar revision: rules, original examples and result reading");
if (slug === "anime-character-archetype-test") return (zh ? "动漫角色读法：叙事功能、分镜实例与研究范围" : "Reading anime story roles: narrative functions, storyboard examples and evidence");
if (slug === "blue-lock") return (zh ? "蓝色监狱结果读法：人物比较、桌游实例与证据范围" : "Reading Blue Lock results: character comparisons, tabletop examples and evidence");
if (slug === "villain-era-archetype-test") return (zh ? "反派时代结果读法：表达实例、文学名称与计数依据" : "Reading Villain Era results: phrase examples,literary names and count evidence");
if (slug === "english-proficiency") return (zh ? "书面英语复习：语言事实、语境实例与测评证据" : "Written English review: language facts,context examples and assessment evidence");
if (slug === "gossip-girl") return (zh ? "绯闻女孩结果读法：人物比较、创作实例与证据范围" : "Reading Gossip Girl results: character comparisons, creative examples and evidence");
if (slug === "amazing-digital-circus") return (zh ? "神奇数字马戏团结果读法：人物比较、例子与证据范围" : "Reading Digital Circus results: character comparisons, examples and evidence");
if (slug === "game-of-thrones") return (zh ? "权力的游戏结果读法：具体比较、计数与证据范围" : "Reading Game of Thrones results: comparisons, counts and evidence");
if (slug === "decade-aesthetic-test") return (zh ? "年代美学结果读法：历史背景、元素比较与证据范围" : "Reading decade aesthetics: history, visual comparisons and evidence");
if (slug === "twilight-character") return (zh ? "暮光之城结果读法：人物比较、实际例子与证据范围" : "Reading Twilight results: character comparisons, examples and evidence");
if (slug === "wednesday-addams-character") return (zh ? "星期三结果读法：人物比较、实际例子与证据范围" : "Reading Wednesday results: character comparisons, examples and evidence");
if (slug === "stranger-things") return (zh ? "怪奇物语结果读法、具体比较与使用范围" : "Reading Stranger Things results, concrete comparisons and scope");
if (slug === "avengers-character") return (zh ? "复仇者结果读法、六种具体比较与使用范围" : "Reading Avengers results, six concrete comparisons and scope");
if (slug === "dexter") return (zh ? "Dexter角色结果读法、具体比较与使用范围" : "Reading Dexter results, concrete comparisons and scope");
if (slug === "spelling-test") return (zh ? "英语拼写的结果读法、词形依据与复习方法" : "Reading spelling results, checking word forms and revising");
if (slug === "harry-potter-character") return (zh ? "《哈利·波特》结果读法：人物区别、活动情境与计分依据" : "Reading Harry Potter results: character distinctions, activity contexts and scoring");
if (slug === "egen-teto") return (zh ? "Egen-Teto结果读法：具体回应、计数与研究范围" : "Reading Egen-Teto results: concrete responses, counts and research scope");
if (slug === "jujutsu-kaisen-character") return (zh ? "《咒术回战》结果读法：人物比较、具体情境与计分依据" : "Reading Jujutsu Kaisen results: character comparisons, concrete situations and scoring");
if (slug === "aptitude-test") return (zh ? "能力倾向练习读法：解题步骤、错误类型与测量证据" : "Reading aptitude practice: solution steps, error types and measurement evidence");
if (slug === "gilmore-girls") return (zh ? "《吉尔莫女孩》结果读法：人物比较、相聚情境与计分依据" : "Reading Gilmore Girls results: character comparisons, gathering situations and scoring");
if (slug === "south-park") return (zh ? "《南方公园》结果读法：人物比较、活动情境与计分依据" : "Reading South Park results: character comparisons, activity situations and scoring");
if (slug === "workplace-technology") return (zh ? "职场技术练习方法：记录、条件、计算与解释范围" : "Workplace technology practice: records, conditions, calculations and scope");
if (slug === "nana-character") return (zh ? "《NANA》结果读法：人物比较、创作情境与计分依据" : "Reading Nana results: character comparisons, creative situations and scoring");
if (slug === "delulu-test") return (zh ? "Delulu结果读法：六种叙事、词义背景与计分依据" : "Reading Delulu results: six tellings, language background and scoring");
if (slug === "cybersecurity-awareness") return (zh ? "网络安全知识复习：情境依据、计分与使用范围" : "Reviewing cyber security knowledge: scenario reasoning, scoring and scope");
if (slug === "wojak") return (zh ? "Wojak结果读法：具体回应、文化背景与计分依据" : "Reading Wojak results: specific responses, cultural context and scoring");
if (slug === "attention-to-detail") return (zh ? "细节注意力练习方法：核对例子、完整计分与研究范围" : "Attention-to-detail practice methods: checking examples, full scoring and research scope");
if (slug === "my-little-pony-character-quiz") return (zh ? "MLP角色结果读法：相处例子、计数与证据范围" : "Reading MLP character results: everyday examples, counts and evidence boundaries");
if (slug === "my-hero-academia-character-quiz") return (zh ? "MHA角色结果读法：具体活动、反例与证据范围" : "Reading MHA character results: activities, counterexamples and evidence boundaries");
if (slug === "hazbin-hotel-character-quiz") return (zh ? "角色匹配阅读指南：具体情境、计数与证据范围" : "Reading character matches: situations, counts and evidence boundaries");
if (slug === "ginny-and-georgia-character-quiz") return (zh ? "角色匹配阅读指南：情境、计数、反例与范围" : "Reading character matches: situations, counts, counterexamples and scope");
if (slug === "next-life") return (zh ? "来世之路阅读指南：想象、代价、研究与现在" : "Next Life reading guide: imagination, costs, research and the present");
if (slug === "dark-triad") return (zh ? "读懂黑暗三角主题自评：研究、算例与具体行为" : "Reading this thematic reflection: research, examples and actual behaviour");
if (slug === "moral-dilemma-test") return (zh ? "从结果继续思考：伦理背景、案例、算例与证据" : "Thinking beyond results: ethical background, cases, counts and evidence");
if (slug === "egogram") return (zh ? "读懂自我状态图：理论、算例、情境与证据" : "Reading an egogram: theory, examples, context and evidence");
if (slug === "social-intelligence-test") return (zh ? "社交理解自评：题意、算例、证据与实际核对" : "Social-understanding self-report: items, examples, evidence and checking");
if (slug === "male-archetype-test") return (zh ? "怎样理解四角色？理论背景、算例与实际观察" : "Understanding the four roles: theory, worked examples and actual observation");
if (slug === "ikigai") return (zh ? "怎样理解Ikigai？文化背景、研究与具体探索" : "Understanding ikigai: culture, research and concrete exploration");
if (slug === "grit-test") return (zh ? "怎样理解毅力？计分算例、研究证据与目标调整" : "Understanding grit: scoring examples, research and goal adjustment");
if (slug === "toxic-trait") return (zh ? "怎样理解互动习惯？算例、研究、反例与修复回顾" : "Understanding interaction habits: examples, research, counterexamples and repair");
if (slug === "intelligence-type-test") return (zh ? "怎样理解思考入口？计数算例、理论边界与任务回顾" : "Understanding thinking approaches: counting examples, theory and task reflection");
if (slug === "locus-of-control") return (zh ? "控制点结果怎样读？题源、算例与现实情境" : "Read the full continuum: locus of control sources, examples and circumstances");
if (slug === "growth-mindset-fixed-mindset") return (zh ? "怎样理解成长型思维？具体算例、研究证据与学习回顾" : "Read the full continuum: growth mindset examples, research and learning reflection");
if (slug === "maturity-test") return (zh ? "成熟度结果怎样读？研究模型、具体算例与日常回顾" : "Reading maturity results: research models, worked examples and everyday reflection");
if (slug === "arabic-personality-compass") return (zh ? "性格罗盘结果读法：具体实例、来源区别与测量证据" : "Reading compass results: examples, source distinctions and measurement evidence");
if (slug === "inkblot-personality-quiz") return (zh ? "墨迹结果怎样读？具体比较、专业研究与看图实例" : "Reading inkblot results: comparisons, professional research and viewing examples");
if (slug === "philosopher-personality-test") return (zh ? "哲学结果读法：九种思路、原典与日常讨论" : "Reading philosopher results: nine perspectives, texts and everyday discussion");
if (slug === "inner-child-personality-test") return (zh ? "童心结果读法：具体比较、研究区别与日常应用" : "Reading playful results: comparisons, research distinctions and everyday use");
if (slug === "light-triad-test") return (zh ? "LTS结果读法、研究依据与日常应用" : "Reading LTS results: evidence and everyday applications");
if (slug === "values") return (zh ? "价值观结果读法、理论区别与研究证据" : "Reading value results: theoretical distinctions and research evidence");
if (slug === "optimism-pessimism") return (zh ? "乐观分数读法、版本对照与研究证据" : "Reading optimism scores: form comparisons and research evidence");
if (slug === "socionics") return (zh ? "Socionics结果读法、模型区别与证据" : "Reading Socionics results: model distinctions and evidence");
if (slug === "sdt-motivation") return (zh ? "自我决定理论：需要、动机与具体情境" : "Self-Determination Theory: needs, motivation and context");
if (slug === "type-ab") return (zh ? "A/B行为模式：研究背景、情境与日常观察" : "A/B behaviour patterns: research context and everyday reflection");
if (slug === "dungeons-dragons-class") return (zh ? "结果读法：职业比较、规则版本与同桌讨论" : "Reading your result: class comparisons, editions and table discussion");
if (slug === "hello-kitty") return (zh ? "角色结果读法：官方背景、具体比较与日常观察" : "Reading your result: official context, comparisons and everyday reflection");
if (slug === "star-wars-character") return (zh ? "角色结果读法：三部曲背景、具体比较与日常应用" : "Reading your result: trilogy context, comparisons and everyday use");
if (slug === "bleach") return (zh ? "角色结果读法：作品语境、具体比较与日常表达" : "Reading your result: series context, comparisons and everyday wording");
if (slug === "death-note") return (zh ? "角色结果读法：作品背景、具体比较与日常应用" : "Reading your result: series context, comparisons and everyday use");
if (slug === "naruto-character") return (zh ? "角色结果读法：具体比较、作品语境与日常应用" : "Reading your result: comparisons, series context and everyday use");
if (slug === "disney-princess") return (zh ? "角色结果读法：人物集合、具体比较与文化背景" : "Reading your result: roster, comparisons and cultural context");
if (slug === "chiikawa") return (zh ? "角色结果读法：作品背景、具体比较与日常应用" : "Reading your result: series context, comparisons and everyday use");
if (slug === "bojack-horseman-character-quiz") return (zh ? "角色结果读法：作品语境、具体例子与日常应用" : "Reading your result: series context, examples and everyday use");
if (slug === "moon-phase") return (zh ? "月相测试读法：天文背景、研究与日常活动" : "Reading your result: astronomy, research and everyday activities");
if (slug === "past-life") return (zh ? "前世测试读法：历史背景、当前兴趣与实践" : "Reading your result: historical context, present interests and activities");
if (slug === "aura-color") return (zh ? "颜色语义、研究证据与结果读法" : "Color meanings, research evidence and interpretation");
if (slug === "what-element-am-i") return (zh ? "四元素背景、结果读法与研究证据" : "Four-element context, interpretation and research evidence");
if (slug === "which-tarot-card-are-you") return (zh ? "塔罗历史、结果读法与研究证据" : "Tarot history, interpretation and research evidence");
if (slug === "greek-god") return (zh ? "古典背景、解释依据与日常选择" : "Classical context, interpretation and everyday choices");
if (slug === "hogwarts-house-quiz") return (zh ? "学院背景、研究证据与日常选择" : "House context, research evidence and everyday choices");
if (slug === "tsundere-dere-type") return (zh ? "文化词义、语言学背景与实际表达" : "Cultural meanings, linguistic context and practical expression");
if (slug === "character-strengths") return (zh ? "性格优势的框架、研究依据与日常应用" : "Character strengths: frameworks, evidence and everyday application");
if (slug === "learning-style") return (zh ? "学习偏好、匹配研究与实际学习任务" : "Learning preferences, matching research and practical tasks");
if (slug === "procrastinator-type-test") return (zh ? "拖延模式、研究背景与具体行动" : "Delay patterns, research background and practical actions");
if (slug === "likable-person-test") return (zh ? "互动选择、好感研究与实际沟通" : "Interaction choices, liking research and practical conversations");
if (slug === "difficult-person-test") return (zh ? "互动行为的含义、情境与沟通实践" : "Interaction patterns: meanings, context and practical conversations");
if (slug === "people-pleaser") return (zh ? "讨好倾向的含义、研究证据与具体表达" : "People pleasing: meanings, research evidence and practical expression");
if (slug === "music-taste-test") return (zh ? "音乐偏好、研究模型与聆听情境" : "Music preferences, research models and listening contexts");
if (slug === "aesthetic-core-test") return (zh ? "视觉风格的含义、研究范围与不购物的小尝试" : "Visual styles: meanings, research scope and no-purchase experiments");
if (slug === "travel-personality-test") return (zh ? "旅行偏好的含义、研究背景与同行协商" : "Travel preferences: meanings, research context and companion agreements");
if (slug === "humor-style-test") return (zh ? "幽默表达的含义、研究框架与互动情境" : "Humor expressions: meanings, research frameworks and interaction");
if (slug === "leadership-style") return (zh ? "领导风格的含义、研究证据与团队实践" : "Leadership styles: meanings, research evidence and team practice");
if (slug === "communication-style") return (zh ? "沟通行为的含义、研究证据与具体表达" : "Communication patterns: meanings, research evidence and practical expression");
if (slug === "attachment-styles") return (zh ? "成人依恋的概念、证据与沟通情境" : "Adult attachment: concepts, evidence and communication contexts");
if (slug === "love-languages") return (zh ? "五种爱的语言：研究证据、情境与沟通方法" : "Five love languages: evidence, context and practical conversation");
if (slug === "temperament") return (zh ? "四种气质的含义、研究证据与沟通实例" : "Four temperaments: meanings, research evidence and conversation examples");
if (slug === "introvert-extrovert") return (zh ? "外向性结果怎样读？题源、证据与沟通实例" : "Reading Extraversion results: sources, evidence and communication examples");
if (slug === "jungian-archetype") return (zh ? "十二原型的含义、来源与使用方法" : "Twelve archetypes: meanings, sources and practical use");
if (slug === "moral-alignment") return (zh ? "道德阵营结果怎样使用？语义、证据与来源" : "Using alignment results: meanings, evidence and sources");
return (zh ? "题本、结果读法与使用范围" : "Questionnaire, reading guide and scope");
})()}</h2><div className="explore-reading-sections">{[...(gapEditorial?.sections ?? []), ...(["love-type-16", "orientation-exploration-test", "stress-check-in-test", "conflict-boundary-behaviors-test", "stress-response-patterns-test", "remote-work", "freelance-ready", "holding-yourself-back", "breakup-reflection-test", "intimacy-preference-test", "habit-patterns-test", "coping-rhythm-test"].includes(slug) ? [] : ((quiz.kind === "four-axes" || quiz.kind === "tipi10") ? [] : quiz.guide)),
    ...(slug === "problem-solving-critical-thinking" ? problemSolvingLandingSections : []),
    ...(slug === "word-skills" ? wordSkillsLandingSections : []),
    ...(slug === "project-management" ? projectManagementLandingSections : []),
    ...(slug === "rizz-test" ? rizzLandingSections : []),
    ...(slug === "personal-finance-literacy" ? personalFinanceLandingSections : []),
    ...(slug === "ai-literacy" ? aiLiteracyLandingSections : []),
    ...(slug === "chinese-zodiac" ? chineseZodiacLandingSections : []),
    ...(slug === "customer-service-aptitude" ? customerServiceLandingSections : []),
    ...(slug === "german-proficiency" ? germanLandingSections : []),
    ...(slug === "zodiac-sign-quiz" ? zodiacStoryLandingSections : []),
    ...(slug === "love-personality" ? lovePersonalityLandingSections : []),
    ...(slug === "situational-judgement" ? situationalJudgementLandingSections : []),
    ...(slug === "8-values-political" ? eightValuesLandingSections : []),
    ...(slug === "relationship-values" ? relationshipValuesLandingSections : []),
    ...(slug === "hexaco" ? hexacoLandingSections : []),
    ...(slug === "relationship-preferences" ? relationshipPreferencesLandingSections : []),
    ...(slug === "abstract-reasoning" ? abstractReasoningLandingSections : []),
    ...(slug === "conservatism" ? conservatismLandingSections : []),
    ...(slug === "numerical-reasoning" ? numericalReasoningLandingSections : []),
    ...(slug === "digital-ethics-citizenship" ? digitalCitizenshipLandingSections : []),
    ...(slug === "adult-age-preferences" ? adultAgePreferencesLandingSections : []),
    ...(slug === "freudian-personality" ? freudianLandingSections : []),
    ...(slug === "relationship-commitment" ? commitmentLandingSections : []),
    ...(slug === "toxic-positivity-test" ? positivePressureLandingSections : []),
    ...(slug === "friendship-compatibility" ? friendshipFitLandingSections : []),
    ...(slug === "perfectionism" ? sapsLandingSections : []),
    ...(slug === "apology-language" ? apologyLandingSections : []),
    ...(slug === "mote-type" ? moteLandingSections : []),
    ...(slug === "jealousy-scale" ? jealousyLandingSections : []),
    ...(slug === "sternberg-love" ? sternbergLandingSections : []),
    ...(slug === "annoying-person-test" ? annoyingLandingSections : []),
    ...(slug === "love-fight-style" ? lovefightLandingSections : []),
    ...(slug === "capacity-to-love-test" ? ctlLandingSections : []),
    ...(slug === "executive-function" ? adexiLandingSections : []),
    ...(slug === "hsp-sensitivity-quiz" ? hspLandingSections : []),
    ...(slug === "competency-test" ? competencyLandingSections : []),
    ...(slug === "sensory-processing-test" ? spqLandingSections : []),
    ...(slug === "parenting-style" ? parentingLandingSections : []),
    ...(slug === "inner-critic-voice-test" ? fscrsLandingSections : []),
    ...(slug === "holding-yourself-back" ? holdingLandingSections : []),
    ...(slug === "conflict-boundary-behaviors-test" ? conflictBoundaryLandingSections : []),
    ...(slug === "stress-check-in-test" ? monthlyStressLandingSections : []),
    ...(slug === "sake-type" ? sakeTypeLandingSections : []),
    ...(slug === "love-type-16" ? loveCombinationsLandingSections : []),
    ...(slug === "food-disgust" ? foodDisgustLandingSections : []),
    ...(slug === "energy-flow" ? energyRhythmLandingSections : []),
    ...(slug === "cyberpunk-edgerunners" ? edgerunnersLandingSections : []),
    ...(slug === "mental-age" ? playfulAgeLandingSections : []),
    ...(slug === "stupidity-test" ? everydayMixupsLandingSections : []),
    ...(slug === "tech-savvy" ? techConfidenceLandingSections : []),
    ...(slug === "orientation-exploration-test" ? orientationLandingSections : []),
    ...(slug === "four-axes-test" ? fourAxesLandingSections : []),
    ...(slug === "seven-sins-virtues-test" ? virtuesLandingSections : []),
    ...(slug === "euphoria-character-quiz" ? euphoriaLandingSections : []),
    ...(slug === "stress-response-patterns-test" ? stressResponseLandingSections : []),
    ...(slug === "remote-work" ? remoteWorkLandingSections : []),
    ...(slug === "freelance-ready" ? freelanceReadyLandingSections : []),
    ...(slug === "coping-rhythm-test" ? copingRhythmLandingSections : []),
    ...(slug === "habit-patterns-test" ? habitPatternsLandingSections : []),
    ...(slug === "intimacy-preference-test" ? intimacyLandingSections : []),
    ...(slug === "breakup-reflection-test" ? breakupLandingSections : []),
    ...(slug === "conflict-styles" ? conflictStylesLandingSections : []),
    ...(slug === "communication-adaptability" ? communicationAdaptabilityLandingSections : []),
    ...(slug === "self-compassion" ? scs26LandingSections : []),
    ...(slug === "wholesome-partner" ? wholesomePartnerLandingSections : []),
    ...(slug === "burnout-risk" ? cbiLandingSections : []),
    ...(slug === "time-management" ? timeManagementLandingSections : []),
    ...(slug === "self-esteem" ? selfEsteemLandingSections : []),
    ...(slug === "morality-6" ? mfq2LandingSections : []),
    ...(slug === "trust-issues-test" ? trustLandingSections : []),
    ...(slug === "libertarian" ? libertyLandingSections : []),
    ...(slug === "spatial-reasoning" ? spatialReasoningLandingSections : []),
    ...(slug === "mechanical-reasoning" ? mechanicalReasoningLandingSections : []),
    ...(slug === "political-coordinates" ? politicalCoordinatesLandingSections : []),
    ...(slug === "sql-test" ? sqlLandingSections : []),
    ...(slug === "color-season" ? colorSeasonLandingSections : []),
    ...(slug === "sales-aptitude" ? salesAptitudeLandingSections : []),
    ...(slug === "python-test" ? pythonLandingSections : []),
    ...(slug === "javascript-test" ? javaScriptLandingSections : []),
    ...(slug === "logical-reasoning" ? logicalReasoningLandingSections : []),
    ...(slug === "eras-of-you-test" ? erasOfYouLandingSections : []),
    ...(slug === "financial-accounting" ? financialAccountingLandingSections : []),
    ...(slug === "java-test" ? javaLandingSections : []),
    ...(slug === "found-family-role-test" ? foundFamilyRoleLandingSections : []),
    ...(slug === "excel-skills" ? excelSkillsLandingSections : []),
    ...(slug === "feminine-energy" ? feminineEnergyLandingSections : []),
    ...(slug === "computer-literacy" ? computerLiteracyLandingSections : []),
    ...(slug === "verbal-reasoning" ? verbalReasoningLandingSections : []),
    ...(slug === "big-fish-energy-test" ? bigFishLandingSections : []),
    ...(slug === "barbie-character" ? barbieLandingSections : []),
    ...(slug === "apocalypse-survival-type-test" ? apocalypseLandingSections : []),
    ...(slug === "spanish-proficiency" ? spanishProficiencyLandingSections : []),
    ...(slug === "space-marine-chapter" ? spaceMarineChaptersLandingSections : []),
    ...(slug === "hundred-acre-wood-friend-quiz" ? storybookFriendsLandingSections : []),
    ...(slug === "grammar-test" ? grammarLandingSections : []),
    ...(slug === "anime-character-archetype-test" ? animeStoryRolesLandingSections : []),
    ...(slug === "blue-lock" ? blueLockLandingSections : []),
    ...(slug === "villain-era-archetype-test" ? villainEraLandingSections : []),
    ...(slug === "english-proficiency" ? englishProficiencyLandingSections : []),
    ...(slug === "gossip-girl" ? gossipGirlLandingSections : []),
    ...(slug === "amazing-digital-circus" ? digitalCircusLandingSections : []),
    ...(slug === "game-of-thrones" ? gameOfThronesLandingSections : []),
    ...(slug === "decade-aesthetic-test" ? decadeLandingSections : []),
    ...(slug === "twilight-character" ? twilightLandingSections : []),
    ...(slug === "wednesday-addams-character" ? wednesdayLandingSections : []),
    ...(slug === "stranger-things" ? strangerThingsLandingSections : []),
    ...(slug === "avengers-character" ? avengersLandingSections : []),
    ...(slug === "dexter" ? dexterLandingSections : []),
    ...(slug === "spelling-test" ? spellingLandingSections : []), ...(slug === "harry-potter-character" ? harryPotterLandingSections : []), ...(slug === "egen-teto" ? egenTetoLandingSections : []), ...(slug === "jujutsu-kaisen-character" ? jujutsuKaisenLandingSections : []), ...(slug === "aptitude-test" ? aptitudeLandingSections : []), ...(slug === "gilmore-girls" ? gilmoreGirlsLandingSections : []), ...(slug === "south-park" ? southParkLandingSections : []), ...(slug === "workplace-technology" ? workplaceTechnologyLandingSections : []), ...(slug === "nana-character" ? nanaLandingSections : []), ...(slug === "delulu-test" ? deluluLandingSections : []), ...(slug === "cybersecurity-awareness" ? cybersecurityLandingSections : []), ...(slug === "wojak" ? wojakLandingSections : []), ...(slug === "attention-to-detail" ? attentionDetailLandingSections : []), ...(slug === "my-little-pony-character-quiz" ? myLittlePonyLandingSections : []), ...(slug === "my-hero-academia-character-quiz" ? myHeroAcademiaLandingSections : []), ...(slug === "hazbin-hotel-character-quiz" ? hazbinHotelLandingSections : []), ...(slug === "ginny-and-georgia-character-quiz" ? ginnyGeorgiaLandingSections : []), ...(slug === "next-life" ? nextLifeLandingSections : []), ...(slug === "dark-triad" ? darkTriadLandingSections : []), ...(slug === "moral-dilemma-test" ? moralDilemmaLandingSections : []), ...(slug === "egogram" ? egogramLandingSections : []), ...(slug === "social-intelligence-test" ? socialIntelligenceLandingSections : []), ...(slug === "male-archetype-test" ? maleRoleLandingSections : []), ...(slug === "ikigai" ? ikigaiLandingSections : []), ...(slug === "grit-test" ? gritLandingSections : []), ...(slug === "toxic-trait" ? habitsLandingSections : []), ...(slug === "intelligence-type-test" ? thinkingApproachLandingSections : []), ...(slug === "locus-of-control" ? locusLandingSections : []), ...(slug === "everyday-control-style" ? controlLandingSections : []), ...(slug === "interpersonal-preferences" ? interpersonalLandingSections : []), ...(slug === "social-attitudes-reflection" ? socialAttitudesLandingSections : []), ...(slug === "attraction-experiences" ? attractionLandingSections.slice(1) : []), ...(slug === "dark-tetrad-sd4" ? sd4LandingSections.slice(1) : []), ...(slug === "work-traits-reflection" ? workTraitsLandingSections.slice(1) : []), ...(slug === "relationship-worry-habits" ? relationshipWorryLandingSections.slice(1) : []), ...(slug === "face-self-image" ? faceSelfImageLandingSections.slice(1) : []), ...(slug === "work-role-reflection" ? workRoleLandingSections.slice(1) : []), ...(slug === "dating-outlook" ? datingOutlookLandingSections.slice(1) : []), ...(slug === "relationship-habits" ? relationshipHabitsLandingSections.slice(1) : []), ...(slug === "intimacy-values" ? intimacyValuesLandingSections.slice(1) : []), ...(slug === "work-activity-interests" ? workActivityLandingSections.slice(1) : []), ...(slug === "tipi-10" ? tipi10LandingSections : []), ...(slug === "growth-mindset-fixed-mindset" ? growthLandingSections : []), ...(slug === "maturity-test" ? maturityLandingSections : []), ...(slug === "arabic-personality-compass" ? compassLandingSections : []), ...(slug === "inkblot-personality-quiz" ? inkblotLandingSections : []), ...(slug === "philosopher-personality-test" ? philosopherLandingSections : [])].filter(section => section.id !== entryMethodSection && !(quiz.kind === "work-role12" && quiz.guide.some(original => original.id === section.id)) && !(hasInlineReferences && section.id === "not-a-fixed-identity") && ((() => {
if (quiz.kind === "adexi14") return !["version", "arithmetic", "direction", "missing", "source-action"].includes(section.id);
if (quiz.kind === "mini-virtues") return !["virtues-scoring", "virtues-complete", "virtues-source"].includes(section.id);
if (quiz.slug === "euphoria-character-quiz") return !["euphoria-counts", "euphoria-routes", "euphoria-edition"].includes(section.id);
if (quiz.kind === "mini-friction") return !["friction-scoring", "friction-complete", "friction-source"].includes(section.id);
if (quiz.kind === "ctl41") return !["ctl-scoring", "ctl-complete", "ctl-edition"].includes(section.id);
if (quiz.kind === "interaction-pairs") return !["original", "counting", "complete"].includes(section.id);
if (quiz.kind === "skills-evidence") return !["scope", "states", "counts"].includes(section.id);
if (quiz.kind === "saps") return !["saps-source", "saps-scoring", "saps-administration"].includes(section.id);
if (quiz.kind === "scs26") return !["scs-method", "scs-missing", "scs-boundary"].includes(section.id);
if (quiz.kind === "cbi") return !["source-scoring", "missing-and-context", "support-and-source"].includes(section.id);
return !["rosenberg-scoring", "rosenberg-reading", "rosenberg-source", "practice-scoring", "practice-reading", "practice-limits", "compass-counts", "compass-ties", "raw-wins-explanation", "ties-explanation", "low-direction-explanation", "facet-scoring", "facet-reading", "facet-comparison", "archetype-counts", "archetype-ties", "archetype-metaphor", "two-axes", "display-bands", "worked-examples", "meaning-limits", "optimism-scoring", "optimism-source", "extraversion-scoring", "extraversion-bands", "extraversion-reading", "affection-scoring", "affection-roles", "affection-reading", "attachment-context", "attachment-scoring", "attachment-reading"].includes(section.id);
})())).map(section => <section key={section.id} className="explore-reading-section"><h3>{section.title[locale]}</h3><div>{section.paragraphs.map((text, index) => <p key={index}>{renderCopy(text[locale])}</p>)}</div></section>)}</div></section>}
    {quiz.kind === "tipi10" && <Tipi10Attribution locale={locale} />}
    {visibleReferences.length ? <section className="my-8 leading-8" aria-labelledby="questionnaire-references"><h2 id="questionnaire-references" className="text-xl font-semibold">{hasInlineReferences ? (zh ? "参考文献与来源说明" : "References and source notes") : (zh ? "背景与来源范围" : "Background and source scope")}</h2><ul className="mt-3 list-disc pl-5">{visibleReferences.map(reference => <li key={reference.url} id={hasInlineReferences ? `${referencePrefix}-reference-${pageReferences.indexOf(reference) + 1}` : undefined}><a className="underline" href={reference.url}>{hasInlineReferences ? `[${pageReferences.indexOf(reference) + 1}] ` : ""}{reference.title[locale]}</a></li>)}</ul>{referenceNote && <p className="mt-3 text-sm text-slate-600">{referenceNote}</p>}</section> : null}
    {quiz.slug === "people-pleaser" && <QuestionnairePpsAttribution locale={locale} />}
  </Container></main>)();
}
