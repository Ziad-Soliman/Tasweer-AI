import React, { useState, useCallback } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { useTranslation } from '../../App';
import { Tooltip } from '../../components/Tooltip';

const storyTypes: {key: keyof typeof import('../../lib/translations').translations.en}[] = [
    { key: 'storyTypeMetaphorical' },
    { key: 'storyTypePersonal' },
    { key: 'storyTypeCustomer' },
    { key: 'storyTypeFounder' },
    { key: 'storyTypeHistorical' }
];



const Stepper = ({ currentStep }: { currentStep: number }) => {
    const { t } = useTranslation();
    const steps = [
        { id: 'build-rapport', titleKey: 'step1Title' },
        { id: 'paint-word-picture', titleKey: 'step2Title' },
        { id: 'lead-into-buying-trance', titleKey: 'step3Title' },
        { id: 'storytelling', titleKey: 'step4Title' },
        { id: 'can-do-stacking', titleKey: 'step5Title' },
        { id: 'hypnotic-suggestions', titleKey: 'step6Title' },
        { id: 'final-review', titleKey: 'step7Title' },
    ];
    return (
        <nav aria-label="Progress">
            <ol role="list" className="space-y-4">
                {steps.map((step, stepIdx) => (
                    <li key={step.id} className="flex items-center">
                        {stepIdx < currentStep ? (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <Icon name="check" className="w-5 h-5 text-primary-foreground" />
                            </div>
                        ) : stepIdx === currentStep ? (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                            </div>
                        ) : (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-border flex items-center justify-center"></div>
                        )}
                        <span className={`ms-3 text-sm font-medium ${stepIdx <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {t(step.titleKey as any)}
                        </span>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

const OutputSection = ({ titleKey, content, isLoading, onCopy }: { titleKey: keyof typeof import('../../lib/translations').translations.en; content: string; isLoading: boolean; onCopy: () => void }) => {
    const { t } = useTranslation();
    return (
        <div>
            <h3 className="text-lg font-semibold text-foreground">{t(titleKey)}</h3>
            <div className="mt-2 p-4 bg-muted rounded-lg min-h-[100px] relative text-sm whitespace-pre-wrap">
                {isLoading && <div className="absolute inset-0 bg-muted/50 flex items-center justify-center"><Icon name="spinner" className="w-6 h-6 animate-spin text-primary" /></div>}
                {content}
                {content && !isLoading && (
                    <Tooltip text={t('copy')}>
                        <button onClick={onCopy} className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-background text-muted-foreground">
                            <Icon name="copy" className="w-4 h-4" />
                        </button>
                    </Tooltip>
                )}
            </div>
        </div>
    );
};


const NeuroSalesCopywriter = ({ onBack }: { onBack: () => void }) => {
    const { t } = useTranslation();
    const steps = [
        { id: 'build-rapport', title: 'Rapport-Building Intro' },
        { id: 'paint-word-picture', title: 'Paint the "Word Picture"' },
        { id: 'lead-into-buying-trance', title: 'Lead into "Buying Trance"' },
        { id: 'storytelling', title: 'Apply Storytelling' },
        { id: 'can-do-stacking', title: '"Can-Do" Stacking' },
        { id: 'hypnotic-suggestions', title: 'Weave in Hypnotic Suggestions' },
        { id: 'final-review', title: 'Final Review & Optimization' },
    ];

    const [userInput, setUserInput] = useState({
        productService: '',
        targetAudience: '',
        buyingMotivations: '',
        selectedStoryType: t(storyTypes[0].key)
    });

    const [aiOutput, setAiOutput] = useState({
        rapport: '', wordPicture: '', buyingTrance: '', story: '', canDoStack: '', hypnoticCopy: '', finalReview: ''
    });

    const [currentStep, setCurrentStep] = useState(0);
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [error, setError] = useState('');

    const handleInputChange = (field: keyof typeof userInput, value: string) => {
        setUserInput(prev => ({ ...prev, [field]: value }));
    };

    const handleGeneration = useCallback(async (stepIndex: number) => {
        const step = steps[stepIndex];
        setLoadingStates(prev => ({ ...prev, [step.id]: true }));
        setError('');

        try {
            const result = await geminiService.generateNeuroSalesCopy(step.id, userInput, aiOutput);
            
            const outputKeyMap: Record<string, keyof Omit<typeof aiOutput, 'hypnoticCopy' | 'finalReview'>> = {
                'build-rapport': 'rapport',
                'paint-word-picture': 'wordPicture',
                'lead-into-buying-trance': 'buyingTrance',
                'storytelling': 'story',
                'can-do-stacking': 'canDoStack',
            };
            const outputKey = outputKeyMap[step.id];

            if (outputKey) {
                setAiOutput(prev => ({...prev, [outputKey]: result }));
                setCurrentStep(stepIndex + 1);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setLoadingStates(prev => ({ ...prev, [step.id]: false }));
        }
    }, [userInput, aiOutput]);
    
    const handleHypnoticWeave = useCallback(async () => {
        const step = steps[5]; // hypnotic-suggestions
        setLoadingStates(prev => ({ ...prev, [step.id]: true }));
        setError('');
        try {
            const result = await geminiService.generateNeuroSalesCopy(step.id, userInput, aiOutput);
            setAiOutput(prev => ({...prev, hypnoticCopy: result }));
            setCurrentStep(6);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setLoadingStates(prev => ({ ...prev, [step.id]: false }));
        }
    }, [userInput, aiOutput]);

    const handleFinalReview = useCallback(async () => {
        const step = steps[6]; // final-review
        setLoadingStates(prev => ({ ...prev, [step.id]: true }));
        setError('');
        try {
            const result = await geminiService.generateNeuroSalesCopy(step.id, userInput, {...aiOutput, canDoStack: aiOutput.hypnoticCopy});
            setAiOutput(prev => ({...prev, finalReview: result }));
            setCurrentStep(7);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setLoadingStates(prev => ({ ...prev, [step.id]: false }));
        }
    }, [userInput, aiOutput]);

    const primaryButtonClasses = "bg-primary text-primary-foreground h-10 px-4 rounded-md font-semibold disabled:opacity-50 flex items-center justify-center gap-2 self-start";

    return (
        <MiniAppLayout onBack={onBack} title={t('neurosales-copywriter-title')} description={t('neurosales-copywriter-desc')}>
            <div className="grid lg:grid-cols-2 gap-8 h-full p-6">
                {/* Left Column: Inputs & Stepper */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-4">
                    <h3 className="text-lg font-semibold">{t('inputDetails')}</h3>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t('productService')}</label>
                        <textarea value={userInput.productService} onChange={e => handleInputChange('productService', e.target.value)} className="w-full bg-input border-border rounded-md p-2 text-sm h-20 resize-none" disabled={currentStep > 0}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t('targetAudience')}</label>
                        <textarea value={userInput.targetAudience} onChange={e => handleInputChange('targetAudience', e.target.value)} className="w-full bg-input border-border rounded-md p-2 text-sm h-20 resize-none" disabled={currentStep > 0}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t('buyingMotivations')}</label>
                        <textarea value={userInput.buyingMotivations} onChange={e => handleInputChange('buyingMotivations', e.target.value)} className="w-full bg-input border-border rounded-md p-2 text-sm h-20 resize-none" disabled={currentStep > 0}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1.5">{t('storytellingAngle')}</label>
                        <select value={userInput.selectedStoryType} onChange={e => handleInputChange('selectedStoryType', e.target.value)} className="w-full bg-input border-border rounded-md p-2 text-sm h-10" disabled={currentStep > 0}>
                            {storyTypes.map(type => <option key={type.key} value={t(type.key)}>{t(type.key)}</option>)}
                        </select>
                    </div>

                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">{t('generationSteps')}</h3>
                        <Stepper currentStep={currentStep} />
                    </div>
                    {currentStep > 0 && currentStep < 7 && <button onClick={() => { setCurrentStep(0); setAiOutput({rapport: '', wordPicture: '', buyingTrance: '', story: '', canDoStack: '', hypnoticCopy: '', finalReview: ''}); }} className="text-sm text-muted-foreground hover:text-foreground self-start">{t('editAndRestart')}</button>}
                </div>

                {/* Right Column: Outputs */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto">
                    {error && <div className="p-4 bg-destructive/20 text-destructive rounded-md">{error}</div>}
                    
                    <OutputSection titleKey="outputRapport" content={aiOutput.rapport} isLoading={loadingStates['build-rapport']} onCopy={() => navigator.clipboard.writeText(aiOutput.rapport)} />
                    {currentStep === 0 && <button onClick={() => handleGeneration(0)} disabled={!userInput.productService || !userInput.targetAudience || loadingStates['build-rapport']} className={primaryButtonClasses}>{t('generateIntro')} <Icon name="arrow-right" className="w-4 h-4"/></button>}
                    
                    <OutputSection titleKey="outputWordPicture" content={aiOutput.wordPicture} isLoading={loadingStates['paint-word-picture']} onCopy={() => navigator.clipboard.writeText(aiOutput.wordPicture)} />
                    {currentStep === 1 && <button onClick={() => handleGeneration(1)} disabled={loadingStates['paint-word-picture']} className={primaryButtonClasses}>{t('generateWordPicture')} <Icon name="arrow-right" className="w-4 h-4"/></button>}
                    
                    <OutputSection titleKey="outputBuyingTrance" content={aiOutput.buyingTrance} isLoading={loadingStates['lead-into-buying-trance']} onCopy={() => navigator.clipboard.writeText(aiOutput.buyingTrance)} />
                    {currentStep === 2 && <button onClick={() => handleGeneration(2)} disabled={loadingStates['lead-into-buying-trance']} className={primaryButtonClasses}>{t('generateLeadIn')} <Icon name="arrow-right" className="w-4 h-4"/></button>}
                    
                    <OutputSection titleKey="outputStory" content={aiOutput.story} isLoading={loadingStates['storytelling']} onCopy={() => navigator.clipboard.writeText(aiOutput.story)} />
                    {currentStep === 3 && <button onClick={() => handleGeneration(3)} disabled={loadingStates['storytelling']} className={primaryButtonClasses}>{t('generateStory')} <Icon name="arrow-right" className="w-4 h-4"/></button>}
                    
                    <OutputSection titleKey="outputCanDo" content={aiOutput.canDoStack} isLoading={loadingStates['can-do-stacking']} onCopy={() => navigator.clipboard.writeText(aiOutput.canDoStack)} />
                    {currentStep === 4 && <button onClick={() => handleGeneration(4)} disabled={loadingStates['can-do-stacking']} className={primaryButtonClasses}>{t('generateCanDo')} <Icon name="arrow-right" className="w-4 h-4"/></button>}

                    <OutputSection titleKey="outputHypnotic" content={aiOutput.hypnoticCopy} isLoading={loadingStates['hypnotic-suggestions']} onCopy={() => navigator.clipboard.writeText(aiOutput.hypnoticCopy)} />
                    {currentStep === 5 && <button onClick={handleHypnoticWeave} disabled={loadingStates['hypnotic-suggestions']} className={primaryButtonClasses}>{t('weaveHypnotic')} <Icon name="arrow-right" className="w-4 h-4"/></button>}

                    <OutputSection titleKey="outputFinal" content={aiOutput.finalReview} isLoading={loadingStates['final-review']} onCopy={() => navigator.clipboard.writeText(aiOutput.finalReview)} />
                    {currentStep === 6 && <button onClick={handleFinalReview} disabled={loadingStates['final-review']} className={primaryButtonClasses}>{t('generateFinal')} <Icon name="arrow-right" className="w-4 h-4"/></button>}
                </div>
            </div>
        </MiniAppLayout>
    );
};

export default NeuroSalesCopywriter;