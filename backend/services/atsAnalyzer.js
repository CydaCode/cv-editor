import natural from 'natural';

const { WordNet, TfIdf } = natural;

export class ATSAnalyzer {
  constructor() {
    // Common ATS keywords by category
    this.requiredSections = [
      'work experience',
      'education',
      'skills',
      'contact',
      'summary',
      'objective'
    ];

    this.commonKeywords = [
      'leadership', 'management', 'communication', 'teamwork',
      'problem solving', 'analytical', 'strategic', 'project management',
      'collaboration', 'innovation', 'results-driven', 'detail-oriented'
    ];

    this.jobTitleKeywords = {
      'software engineer': ['programming', 'development', 'coding', 'software', 'algorithm', 'debugging'],
      'data scientist': ['machine learning', 'data analysis', 'python', 'statistics', 'modeling'],
      'product manager': ['product', 'strategy', 'roadmap', 'stakeholder', 'agile', 'scrum'],
      'marketing': ['marketing', 'campaign', 'brand', 'social media', 'SEO', 'analytics'],
      'sales': ['sales', 'revenue', 'client', 'customer', 'negotiation', 'relationship']
    };
  }

  analyze(content) {
    const text = content.toLowerCase();
    const analysis = {
      score: 0,
      maxScore: 100,
      feedback: {
        sections: {},
        keywords: {},
        formatting: {},
        readability: {},
        recommendations: []
      }
    };

    // Check for required sections
    const sectionScore = this.checkSections(text);
    analysis.feedback.sections = sectionScore;
    analysis.score += sectionScore.score;

    // Check keyword density
    const keywordScore = this.checkKeywords(text);
    analysis.feedback.keywords = keywordScore;
    analysis.score += keywordScore.score;

    // Check formatting issues
    const formattingScore = this.checkFormatting(content);
    analysis.feedback.formatting = formattingScore;
    analysis.score += formattingScore.score;

    // Check readability
    const readabilityScore = this.checkReadability(content);
    analysis.feedback.readability = readabilityScore;
    analysis.score += readabilityScore.score;

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

    const score = (foundSections.length / this.requiredSections.length) * 30;
    
    return {
      found: foundSections,
      missing: missingSections,
      score: Math.round(score),
      maxScore: 30
    };
  }

  checkKeywords(text) {
    const foundKeywords = [];
    const missingKeywords = [];
    const keywordCounts = {};

    this.commonKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/\s+/g, '[\\s-]?')}\\b`, 'gi');
      const matches = text.match(regex);
      const count = matches ? matches.length : 0;
      
      keywordCounts[keyword] = count;
      
      if (count > 0) {
        foundKeywords.push({ keyword, count });
      } else {
        missingKeywords.push(keyword);
      }
    });

    // Calculate keyword density score (max 30 points)
    const totalKeywords = foundKeywords.reduce((sum, item) => sum + item.count, 0);
    const keywordDensity = (totalKeywords / (text.split(/\s+/).length / 100)) || 0;
    const score = Math.min(30, Math.round(keywordDensity * 2 + (foundKeywords.length / this.commonKeywords.length) * 10));

    return {
      found: foundKeywords,
      missing: missingKeywords,
      keywordCounts,
      density: keywordDensity.toFixed(2),
      score: Math.round(score),
      maxScore: 30
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

  checkReadability(content) {
    const sentences = content.match(/[.!?]+/g) || [];
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const avgSentencesPerParagraph = sentences.length / Math.max(paragraphs.length, 1);

    let score = 20; // Start with full points

    // Ideal: 15-20 words per sentence
    if (avgWordsPerSentence > 25) {
      score -= 5;
    } else if (avgWordsPerSentence < 10) {
      score -= 3;
    }

    // Ideal: 3-5 sentences per paragraph
    if (avgSentencesPerParagraph > 8) {
      score -= 3;
    } else if (avgSentencesPerParagraph < 2) {
      score -= 2;
    }

    // Check for bullet points (good for readability)
    const bulletPoints = (content.match(/[•\-\*]\s+/g) || []).length;
    if (bulletPoints < 5 && words.length > 200) {
      score -= 2;
    }

    return {
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
      avgSentencesPerParagraph: avgSentencesPerParagraph.toFixed(1),
      totalWords: words.length,
      totalSentences: sentences.length,
      totalParagraphs: paragraphs.length,
      score: Math.max(0, score),
      maxScore: 20
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

    // Keyword recommendations
    if (feedback.keywords.missing.length > 0) {
      const topMissing = feedback.keywords.missing.slice(0, 5);
      recommendations.push({
        type: 'keyword',
        priority: 'medium',
        message: `Consider adding these keywords: ${topMissing.join(', ')}`
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

    // Readability recommendations
    if (feedback.readability.avgWordsPerSentence > 25) {
      recommendations.push({
        type: 'readability',
        priority: 'medium',
        message: 'Consider breaking down long sentences for better readability'
      });
    }

    if (feedback.keywords.density < 1) {
      recommendations.push({
        type: 'keyword',
        priority: 'high',
        message: 'Increase keyword density by naturally incorporating relevant industry terms'
      });
    }

    return recommendations;
  }
}

export default new ATSAnalyzer();

