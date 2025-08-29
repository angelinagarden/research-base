import React from 'react';

interface ResearchItem {
  id: string;
  title: string;
  institution: string;
  summary: string;
  domain: string;
  focus: string;
  timeAgo: string;
}

const ContentGrid = () => {
  const researchItems: ResearchItem[] = [
    {
      id: '1',
      title: 'Neural Network Optimization in Quantum Computing Environments',
      institution: 'MIT Computer Science Lab',
      summary: 'Investigation of quantum-enhanced neural networks for complex optimization problems with applications in cryptography and machine learning.',
      domain: 'Quantum Computing',
      focus: 'Applied',
      timeAgo: 'less than a minute ago'
    },
    {
      id: '2', 
      title: 'CRISPR-Cas9 Gene Editing: Ethical Frameworks',
      institution: 'Stanford Bioethics Institute',
      summary: 'Comprehensive analysis of ethical considerations surrounding gene editing technologies and their implications for human enhancement.',
      domain: 'Biotechnology',
      focus: 'Theoretical',
      timeAgo: 'less than a minute ago'
    },
    {
      id: '3',
      title: 'Neuroplasticity in Adult Learning Systems',
      institution: 'Harvard Neuroscience Department',
      summary: 'Experimental research on brain adaptation mechanisms in adult learners and implications for cognitive enhancement therapies.',
      domain: 'Neuroscience',
      focus: 'Experimental',
      timeAgo: '2 minutes ago'
    },
    {
      id: '4',
      title: 'Large Language Models: Emergent Reasoning Capabilities',
      institution: 'OpenAI Research Division',
      summary: 'Comprehensive study of reasoning emergence in large-scale language models and their potential for artificial general intelligence.',
      domain: 'AI & Machine Learning',
      focus: 'Applied', 
      timeAgo: '5 minutes ago'
    },
    {
      id: '5',
      title: 'Quantum Entanglement in Biological Systems',
      institution: 'Cambridge Physics Laboratory',
      summary: 'Theoretical investigation of quantum mechanical effects in biological processes, particularly photosynthesis and neural computation.',
      domain: 'Quantum Computing',
      focus: 'Theoretical',
      timeAgo: '12 minutes ago'
    },
    {
      id: '6',
      title: 'Bioengineered Materials for Neural Interfaces',
      institution: 'Caltech Materials Science',
      summary: 'Development of biocompatible materials for next-generation brain-computer interfaces with improved signal fidelity.',
      domain: 'Biotechnology',
      focus: 'Applied',
      timeAgo: '25 minutes ago'
    }
  ];

  return (
    <main className="flex-1 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {researchItems.map((item, index) => (
          <div 
            key={item.id} 
            className="border border-grid-border bg-card hover:bg-hover-subtle transition-colors cursor-pointer group"
          >
            <div className="aspect-[4/3] bg-accent flex items-center justify-center relative overflow-hidden p-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
                  {item.domain}
                </div>
                <div className="text-sm text-foreground font-mono">
                  {item.focus}
                </div>
              </div>
            </div>
            <div className="p-4 font-mono space-y-2">
              <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
                {item.title}
              </h3>
              <p className="text-xs text-nav-active font-medium">{item.institution}</p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {item.summary}
              </p>
              <p className="text-xs text-muted-foreground pt-2">{item.timeAgo}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default ContentGrid;