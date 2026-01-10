import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  Button,
  useToast,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react'
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons'
import axios from 'axios'

interface ATSFeedbackProps {
  analysis: any
  cvId: string
  onReanalyze: (analysis: any) => void
}

export default function ATSFeedback({
  analysis,
  cvId,
  onReanalyze,
}: ATSFeedbackProps) {
  const [reanalyzing, setReanalyzing] = useState(false)
  const toast = useToast()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

  const handleReanalyze = async () => {
    setReanalyzing(true)
    try {
      const response = await axios.post(`${API_URL}/cv/${cvId}/analyze`)
      onReanalyze(response.data.atsAnalysis)

      toast({
        title: 'Re-analysis complete',
        description: 'Your CV has been re-analyzed',
        status: 'success',
        duration: 2000,
      })
    } catch (error: any) {
      toast({
        title: 'Re-analysis failed',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setReanalyzing(false)
    }
  }

  if (!analysis) {
    return (
      <Box textAlign="center" py={8}>
        <Text>No analysis available. Please upload a CV first.</Text>
      </Box>
    )
  }

  const score = analysis.score || 0
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green'
    if (score >= 60) return 'yellow'
    return 'red'
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="xl" fontWeight="bold">
          ATS Compliance Score
        </Text>
        <Button
          size="sm"
          onClick={handleReanalyze}
          isLoading={reanalyzing}
          loadingText="Re-analyzing..."
        >
          Refresh Analysis
        </Button>
      </HStack>

      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        borderWidth="1px"
        textAlign="center"
      >
        <CircularProgress
          value={score}
          color={getScoreColor(score)}
          size="120px"
          thickness="8px"
        >
          <CircularProgressLabel fontSize="2xl" fontWeight="bold">
            {score}%
          </CircularProgressLabel>
        </CircularProgress>
        <Text mt={4} fontSize="lg" fontWeight="semibold">
          {score >= 80
            ? 'Excellent! Your CV is well-optimized for ATS systems.'
            : score >= 60
            ? 'Good, but there is room for improvement.'
            : 'Your CV needs optimization for better ATS compatibility.'}
        </Text>
      </Box>

      <Accordion allowMultiple defaultIndex={[0, 1, 2, 3]}>
        {/* Sections Analysis */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Text fontWeight="semibold">Required Sections</Text>
                <Badge colorScheme={analysis.feedback?.sections?.score >= 25 ? 'green' : 'yellow'}>
                  {analysis.feedback?.sections?.score || 0}/
                  {analysis.feedback?.sections?.maxScore || 30} points
                </Badge>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack align="stretch" spacing={3}>
              {analysis.feedback?.sections?.found?.length > 0 && (
                <Box>
                  <Text fontWeight="semibold" mb={2}>
                    Found Sections:
                  </Text>
                  <List spacing={2}>
                    {analysis.feedback.sections.found.map(
                      (section: string, idx: number) => (
                        <ListItem key={idx}>
                          <ListIcon as={CheckCircleIcon} color="green.500" />
                          {section}
                        </ListItem>
                      )
                    )}
                  </List>
                </Box>
              )}
              {analysis.feedback?.sections?.missing?.length > 0 && (
                <Box>
                  <Text fontWeight="semibold" mb={2} color="red.500">
                    Missing Sections:
                  </Text>
                  <List spacing={2}>
                    {analysis.feedback.sections.missing.map(
                      (section: string, idx: number) => (
                        <ListItem key={idx}>
                          <ListIcon as={WarningIcon} color="red.500" />
                          {section}
                        </ListItem>
                      )
                    )}
                  </List>
                </Box>
              )}
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        {/* Keywords Analysis */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Text fontWeight="semibold">Keywords</Text>
                <Badge colorScheme={analysis.feedback?.keywords?.score >= 20 ? 'green' : 'yellow'}>
                  {analysis.feedback?.keywords?.score || 0}/
                  {analysis.feedback?.keywords?.maxScore || 30} points
                </Badge>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" color="gray.600">
                Keyword Density: {analysis.feedback?.keywords?.density || 0}%
              </Text>
              {analysis.feedback?.keywords?.found?.length > 0 && (
                <Box>
                  <Text fontWeight="semibold" mb={2}>
                    Found Keywords:
                  </Text>
                  <HStack flexWrap="wrap" spacing={2}>
                    {analysis.feedback.keywords.found.map(
                      (item: any, idx: number) => (
                        <Badge
                          key={idx}
                          colorScheme="green"
                          p={2}
                        >
                          {item.keyword} ({item.count})
                        </Badge>
                      )
                    )}
                  </HStack>
                </Box>
              )}
              {analysis.feedback?.keywords?.missing?.length > 0 && (
                <Box>
                  <Text fontWeight="semibold" mb={2} color="orange.500">
                    Suggested Keywords:
                  </Text>
                  <HStack flexWrap="wrap" spacing={2}>
                    {analysis.feedback.keywords.missing.map(
                      (keyword: string, idx: number) => (
                        <Badge key={idx} colorScheme="orange" p={2}>
                          {keyword}
                        </Badge>
                      )
                    )}
                  </HStack>
                </Box>
              )}
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        {/* Formatting Analysis */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Text fontWeight="semibold">Formatting</Text>
                <Badge colorScheme={analysis.feedback?.formatting?.score >= 15 ? 'green' : 'yellow'}>
                  {analysis.feedback?.formatting?.score || 0}/
                  {analysis.feedback?.formatting?.maxScore || 20} points
                </Badge>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {analysis.feedback?.formatting?.issues?.length > 0 ? (
              <List spacing={2}>
                {analysis.feedback.formatting.issues.map(
                  (issue: string, idx: number) => (
                    <ListItem key={idx}>
                      <ListIcon as={WarningIcon} color="orange.500" />
                      {issue}
                    </ListItem>
                  )
                )}
              </List>
            ) : (
              <Text color="green.500">
                <ListIcon as={CheckCircleIcon} color="green.500" />
                No formatting issues detected. Your CV formatting is ATS-friendly.
              </Text>
            )}
          </AccordionPanel>
        </AccordionItem>

        {/* Readability Analysis */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Text fontWeight="semibold">Readability</Text>
                <Badge colorScheme={analysis.feedback?.readability?.score >= 15 ? 'green' : 'yellow'}>
                  {analysis.feedback?.readability?.score || 0}/
                  {analysis.feedback?.readability?.maxScore || 20} points
                </Badge>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack align="stretch" spacing={2}>
              <Text>
                <strong>Average words per sentence:</strong>{' '}
                {analysis.feedback?.readability?.avgWordsPerSentence || 0}
              </Text>
              <Text>
                <strong>Average sentences per paragraph:</strong>{' '}
                {analysis.feedback?.readability?.avgSentencesPerParagraph || 0}
              </Text>
              <Text>
                <strong>Total words:</strong>{' '}
                {analysis.feedback?.readability?.totalWords || 0}
              </Text>
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        {/* Recommendations */}
        {analysis.feedback?.recommendations?.length > 0 && (
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <HStack>
                  <Text fontWeight="semibold">Recommendations</Text>
                  <Badge colorScheme="blue">
                    {analysis.feedback.recommendations.length} items
                  </Badge>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <List spacing={3}>
                {analysis.feedback.recommendations.map(
                  (rec: any, idx: number) => (
                    <ListItem key={idx}>
                      <ListIcon
                        as={
                          rec.priority === 'high'
                            ? WarningIcon
                            : InfoIcon
                        }
                        color={
                          rec.priority === 'high' ? 'red.500' : 'blue.500'
                        }
                      />
                      <Badge
                        colorScheme={
                          rec.priority === 'high' ? 'red' : 'blue'
                        }
                        mr={2}
                      >
                        {rec.priority}
                      </Badge>
                      {rec.message}
                    </ListItem>
                  )
                )}
              </List>
            </AccordionPanel>
          </AccordionItem>
        )}
      </Accordion>
    </VStack>
  )
}

