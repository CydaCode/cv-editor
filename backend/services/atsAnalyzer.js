export class DevOpsATSAnalyzer {
  constructor() {
    this.requiredSections = [
      'experience',
      'skills',
      'projects',
      'education'
    ];

    this.impactKeywords = [
      'automated', 'reduced', 'improved', 'optimized',
      'scaled', 'secured', 'migrated', 'deployed'
    ];

    this.devopsKeywordGroups = {
      cicd: [
        'jenkins', 'github actions', 'gitlab ci', 'circleci', 'argocd'
      ],
      containers: [
        'docker', 'kubernetes', 'helm', 'containerd'
      ],
      cloud: [
        'aws', 'ec2', 's3', 'iam', 'eks',
        'azure', 'gcp'
      ],
      infrastructure: [
        'terraform', 'cloudformation', 'pulumi'
      ],
      configuration: [
        'ansible', 'chef', 'puppet'
      ],
      monitoring: [
        'prometheus', 'grafana', 'elk', 'datadog'
      ],
      security: [
        'iam', 'secrets', 'vault', 'trivy'
      ],
      osNetworking: [
        'linux', 'bash', 'tcp/ip', 'dns', 'nginx'
      ],
      practices: [
        'gitops', 'blue green', 'canary',
        'automation', 'scalability', 'high availability'
      ]
    };
  }

  analyze(content) {
    const text = content.toLowerCase();
    const analysis = {
      score: 0,
      maxScore: 100,
      feedback: {
        sections: {},
        devopsSkills: {},
        impact: {},
        formatting: {},
        recommendations: []
      }
    };

    // Check for required sections
    const sectionScore = this.checkSections(text);
    analysis.feedback.sections = sectionScore;
    analysis.score += sectionScore.score;

    // Check DevOps skills coverage
    const skillScore = this.checkDevOpsSkills(text);
    analysis.feedback.devopsSkills = skillScore;
    analysis.score += skillScore.score;

    // Check impact / results language
    const impactScore = this.checkImpact(text);
    analysis.feedback.impact = impactScore;
    analysis.score += impactScore.score;

    // Check formatting issues
    const formattingScore = this.checkFormatting(content);
    analysis.feedback.formatting = formattingScore;
    analysis.score += formattingScore.score;

    // Generate recommendations
    analysis.feedback.recommendations = this.generateRecommendations(analysis.feedback);

    // Ensure score is between 0 and 100
    analysis.score = Math.max(0, Math.min(100, analysis.score));

    return analysis;
  }

  checkSections(text) {
    const foundSections = [];
    const missingSections = [];

    this.requiredSections.forEach(section => {
      const patterns = [
        section,
        section.replace(' ', ''),
        section.replace(' ', '-'),
        section.split(' ').map(w => w[0]).join('')
      ];

      const found = patterns.some(pattern => 
        text.includes(pattern) || 
        new RegExp(`\\b${pattern}\\b`, 'i').test(text)
      );

      if (found) {
        foundSections.push(section);
      } else {
        missingSections.push(section);
      }
    });

    // Max 25 points for sections
    const score = (foundSections.length / this.requiredSections.length) * 25;
    
    return {
      found: foundSections,
      missing: missingSections,
      score: Math.round(score),
      maxScore: 25
    };
  }

  checkDevOpsSkills(text) {
    const groupResults = {};
    let totalKeywordsFound = 0;
    let groupsWithCoverage = 0;

    Object.entries(this.devopsKeywordGroups).forEach(([groupName, keywords]) => {
      const found = [];
      const missing = [];

      keywords.forEach((keyword) => {
        const pattern = keyword.replace(/\s+/g, '[\\s-]?');
        const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
        const matches = text.match(regex);
        const count = matches ? matches.length : 0;

        if (count > 0) {
          found.push({ keyword, count });
          totalKeywordsFound += count;
        } else {
          missing.push(keyword);
        }
      });

      if (found.length > 0) {
        groupsWithCoverage += 1;
      }

      groupResults[groupName] = {
        found,
        missing,
      };
    });

    const totalGroups = Object.keys(this.devopsKeywordGroups).length;

    // Skill score (max 45):
    // - 25 points for breadth across groups
    // - 20 points for overall keyword count / density
    const breadthScore = (groupsWithCoverage / totalGroups) * 25;
    const wordCount = text.split(/\s+/).filter(Boolean).length || 1;
    const density = (totalKeywordsFound / wordCount) * 100; // keywords per 100 words
    const densityScore = Math.min(20, density); // cap at 20

    const score = Math.round(Math.min(45, breadthScore + densityScore));

    return {
      groups: groupResults,
      totalKeywordsFound,
      groupsWithCoverage,
      totalGroups,
      density: density.toFixed(2),
      score,
      maxScore: 45,
    };
  }

  checkFormatting(content) {
    const issues = [];
    let score = 20; // Start with full points

    // Check for tables (often problematic in ATS)
    const tablePatterns = [
      /<table/i,
      /\|\s*\|/,
      /┌.*┐/,
      /╔.*╗/
    ];
    
    const hasTables = tablePatterns.some(pattern => pattern.test(content));
    if (hasTables) {
      issues.push('Contains tables which may not parse well in ATS systems');
      score -= 5;
    }

    // Check for images/graphics
    const imagePatterns = [
      /<img/i,
      /\[image\]/i,
      /\.(jpg|jpeg|png|gif)/i
    ];
    
    const hasImages = imagePatterns.some(pattern => pattern.test(content));
    if (hasImages) {
      issues.push('Contains images which ATS systems cannot read');
      score -= 5;
    }

    // Check for text boxes
    const textBoxPatterns = [
      /text box/i,
      /textbox/i
    ];
    
    const hasTextBoxes = textBoxPatterns.some(pattern => pattern.test(content));
    if (hasTextBoxes) {
      issues.push('Contains text boxes which may not be parsed correctly');
      score -= 5;
    }

    // Check for unusual characters
    const unusualChars = /[^\w\s\.,;:!?\-()\[\]{}'"]/g;
    const unusualMatches = content.match(unusualChars);
    if (unusualMatches && unusualMatches.length > 50) {
      issues.push('Contains many unusual characters that may cause parsing issues');
      score -= 3;
    }

    // Check for proper line breaks
    const lineBreaks = (content.match(/\n/g) || []).length;
    const wordCount = content.split(/\s+/).length;
    const lineBreakRatio = lineBreaks / wordCount;
    
    if (lineBreakRatio < 0.01) {
      issues.push('May lack proper formatting and line breaks');
      score -= 2;
    }

    return {
      issues,
      score: Math.max(0, score),
      maxScore: 20
    };
  }

  checkImpact(text) {
    let impactCount = 0;
    const found = [];
    const missing = [];

    this.impactKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      const count = matches ? matches.length : 0;

      if (count > 0) {
        impactCount += count;
        found.push({ keyword, count });
      } else {
        missing.push(keyword);
      }
    });

    // Max 10 points for impact language
    const score = Math.min(10, impactCount * 2);

    return {
      found,
      missing,
      totalImpactTerms: impactCount,
      score,
      maxScore: 10,
    };
  }

  generateRecommendations(feedback) {
    const recommendations = [];

    // Section recommendations
    if (feedback.sections.missing.length > 0) {
      recommendations.push({
        type: 'section',
        priority: 'high',
        message: `Add missing sections: ${feedback.sections.missing.join(', ')}`
      });
    }

    // DevOps skills (breadth) recommendations
    if (feedback.devopsSkills && feedback.devopsSkills.groups) {
      const weakGroups = Object.entries(feedback.devopsSkills.groups)
        .filter(([, value]) => value.found.length === 0)
        .map(([name]) => name);

      if (weakGroups.length > 0) {
        recommendations.push({
          type: 'skills',
          priority: 'high',
          message: `Add concrete experience for these DevOps areas: ${weakGroups.join(', ')}`
        });
      }
    }

    // Impact language recommendations
    if (feedback.impact && feedback.impact.missing && feedback.impact.totalImpactTerms === 0) {
      recommendations.push({
        type: 'impact',
        priority: 'medium',
        message: 'Use impact-focused verbs (e.g. automated, reduced, improved, optimized) to describe your results'
      });
    }

    // Formatting recommendations
    if (feedback.formatting.issues.length > 0) {
      recommendations.push({
        type: 'formatting',
        priority: 'high',
        message: `Formatting issues: ${feedback.formatting.issues.join('; ')}`
      });
    }

    return recommendations;
  }
}

export default new DevOpsATSAnalyzer();

