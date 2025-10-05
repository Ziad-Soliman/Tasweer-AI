import React, { useState, useCallback } from 'react';
import MiniAppLayout from './shared/MiniAppLayout';
import { Icon } from '../../components/Icon';
import * as geminiService from '../../services/geminiService';
import { useTranslation } from '../../App';
import { Tooltip } from '../../components/Tooltip';

const storyTypes = [
    'Metaphorical Story',
    'Personal Anecdote',
    'Customer Success Story',
    'Founder\'s Journey',
    'Historical Parallel'
];

const steps = [
    { id: 'build-rapport', title: 'Rapport-Building Intro' },
    { id: 'paint-word-picture', title: 'Paint the "Word Picture"' },
    { id: 'lead-into-buying-trance', title: 'Lead into "Buying Trance"' },
    { id: 'storytelling', title: 'Apply Storytelling' },
    { id: 'can-do-stacking', title: '"Can-Do" Stacking' },
    { id: 'hypnotic-suggestions', title: 'Weave in Hypnotic Suggestions' },
    { id: 'final-review', title: 'Final Review & Optimization' },
];

const Stepper = ({ currentStep }: { currentStep: number }) => (
    <nav aria-label="Progress">
        <ol role="list" className="space-y-4">
            {steps.map((step, stepIdx) => (
                <li key={step.title} className="flex items-center">
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
                        {step.title}
                    </span>
                </li>
            ))}
        </ol>
    </nav>
);

const OutputSection = ({ title, content, isLoading, onCopy }: { title: string; content: string; isLoading: boolean; onCopy: () => void }) => (
    <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="mt-2 p-4 bg-muted rounded-lg min-h-[100px] relative text-sm whitespace-pre-wrap">
            {isLoading && <div className="absolute inset-0 bg-muted/50 flex items-center justify-center"><Icon name="spinner" className="w-6 h-6 animate-spin text-primary" /></div>}
            {content}
            {content && !isLoading && (
                <Tooltip text="Copy">
                    <button onClick={onCopy} className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-background text-muted-foreground">
                        <Icon name="copy" className="w-4 h-4" />
                    </button>
                </Tooltip>
            )}
        </div>
    </div>
);


const NeuroSalesCopywriter = ({ onBack }: { onBack: () => void }) => {
    const { t } = useTranslation();

    const [userInput, setUserInput] = useState({
        productService: '',
        targetAudience: '',
        buyingMotivations: '',
        selectedStoryType: storyTypes[0]
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
            setAiOutput(prev => ({...prev, [step.id.split('-')[0]]: result }));
            setCurrentStep(stepIndex + 1);
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

    const isInputValid = userInput.productService && userInput.targetAudience && userInput.buyingMotivations;

    const renderControls = () => {
        if (currentStep === 0) {
            return (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">1. Foundation</h2>
                    <p className="text-sm text-muted-foreground">Provide the core details about your product and audience.</p>
                    <div>
                        <label className="text-sm font-medium">Product/Service</label>
                        <textarea value={userInput.productService} onChange={e => handleInputChange('productService', e.target.value)} className="w-full mt-1 p-2 bg-muted rounded border border-input min-h-[80px]"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Target Audience & Current Trance</label>
                        <textarea value={userInput.targetAudience} onChange={e => handleInputChange('targetAudience', e.target.value)} className="w-full mt-1 p-2 bg-muted rounded border border-input min-h-[80px]"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Audience Buying Motivations & Pain Points</label>
                        <textarea value={userInput.buyingMotivations} onChange={e => handleInputChange('buyingMotivations', e.target.value)} className="w-full mt-1 p-2 bg-muted rounded border border-input min-h-[80px]"/>
                    </div>
                    <button onClick={() => setCurrentStep(1)} disabled={!isInputValid} className="w-full h-11 bg-primary text-primary-foreground rounded-md font-semibold disabled:opacity-50">Start Writing</button>
                </div>
            );
        }

        const stepIndex = currentStep - 1;
        const step = steps[stepIndex];
        const isWeaveStep = step.id === 'hypnotic-suggestions';
        const isReviewStep = step.id === 'final-review';

        let action;
        if (isWeaveStep) action = handleHypnoticWeave;
        else if (isReviewStep) action = handleFinalReview;
        else action = () => handleGeneration(stepIndex);
        
        let prerequisitesMet = true;
        if (isWeaveStep) prerequisitesMet = !!(aiOutput.rapport && aiOutput.wordPicture && aiOutput.buyingTrance && aiOutput.story && aiOutput.canDoStack);
        if (isReviewStep) prerequisitesMet = !!aiOutput.hypnoticCopy;


        return (
             <div className="space-y-6">
                <Stepper currentStep={stepIndex} />
                {currentStep <= steps.length && (
                    <div className="bg-background border rounded-lg p-4">
                        <h3 className="font-semibold">{stepIndex + 2}. {step.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {isWeaveStep ? "Combines all previous text and embeds hypnotic phrases." : isReviewStep ? "Provides a final, critical analysis of the complete text." : `Generates the "${step.title}" portion of the copy.`}
                        </p>
                        {step.id === 'storytelling' && (
                            <div className="mt-3">
                                <label className="text-sm font-medium">Story Type</label>
                                <select value={userInput.selectedStoryType} onChange={e => handleInputChange('selectedStoryType', e.target.value)} className="w-full mt-1 h-10 p-2 bg-muted rounded border border-input text-sm">
                                    {storyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                        )}
                        <button onClick={action} disabled={loadingStates[step.id] || !prerequisitesMet} className="w-full mt-4 h-11 bg-primary text-primary-foreground rounded-md font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                            {loadingStates[step.id] ? <Icon name="spinner" className="w-5 h-5 animate-spin"/> : `Generate ${step.title}`}
                        </button>
                    </div>
                )}
                 {currentStep > steps.length && <p className="text-center text-primary font-semibold">Copy generation complete!</p>}
             </div>
        );
    };

    return (
        <MiniAppLayout onBack={onBack} title={t('neurosales-copywriter-title')} description={t('neurosales-copywriter-desc')}>
             <div className="grid md:grid-cols-[400px_1fr] gap-8 h-full">
                <div className="bg-card border-r p-6 overflow-y-auto">
                    {renderControls()}
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <h2 className="text-xl font-bold">Generated Copy</h2>
                    {error && <div className="p-3 bg-destructive/20 text-destructive text-sm rounded-md">{error}</div>}
                    <OutputSection title="Rapport-Building Intro" content={aiOutput.rapport} isLoading={loadingStates['build-rapport']} onCopy={() => navigator.clipboard.writeText(aiOutput.rapport)} />
                    <OutputSection title="Word Picture" content={aiOutput.wordPicture} isLoading={loadingStates['paint-word-picture']} onCopy={() => navigator.clipboard.writeText(aiOutput.wordPicture)} />
                    <OutputSection title="Buying Trance Lead-in" content={aiOutput.buyingTrance} isLoading={loadingStates['lead-into-buying-trance']} onCopy={() => navigator.clipboard.writeText(aiOutput.buyingTrance)} />
                    <OutputSection title="Story" content={aiOutput.story} isLoading={loadingStates['storytelling']} onCopy={() => navigator.clipboard.writeText(aiOutput.story)} />
                    <OutputSection title="Can-Do Stack" content={aiOutput.canDoStack} isLoading={loadingStates['can-do-stacking']} onCopy={() => navigator.clipboard.writeText(aiOutput.canDoStack)} />
                    <OutputSection title="Final Hypnotic Copy" content={aiOutput.hypnoticCopy} isLoading={loadingStates['hypnotic-suggestions']} onCopy={() => navigator.clipboard.writeText(aiOutput.hypnoticCopy)} />
                    <OutputSection title="Final Review" content={aiOutput.finalReview} isLoading={loadingStates['final-review']} onCopy={() => navigator.clipboard.writeText(aiOutput.finalReview)} />
                </div>
             </div>
        </MiniAppLayout>
    );
};

export default NeuroSalesCopywriter;
