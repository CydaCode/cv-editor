import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import FileUploader from '../components/FileUploader'
import CVEditor from '../components/CVEditor'
import ATSFeedback from '../components/ATSFeedback'

export default function Home() {
  const [cvData, setCvData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState(0)

  const handleUploadSuccess = (data: any) => {
    setCvData(data.cv)
    setActiveTab(1) // Switch to editor tab
  }

  const handleContentUpdate = (content: string) => {
    if (cvData) {
      setCvData({ ...cvData, editedContent: content })
    }
  }

  const handleAnalysisUpdate = (analysis: any) => {
    if (cvData) {
      setCvData({ ...cvData, atsAnalysis: analysis })
    }
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={2}>
            CV Editor & ATS Compliance Tool
          </Heading>
          <Heading as="h2" size="md" color="gray.600" fontWeight="normal">
            Upload, edit, and optimize your CV for better ATS visibility
          </Heading>
        </Box>

        <Tabs index={activeTab} onChange={setActiveTab} colorScheme="brand">
          <TabList>
            <Tab>Upload CV</Tab>
            <Tab isDisabled={!cvData}>Edit CV</Tab>
            <Tab isDisabled={!cvData}>ATS Analysis</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <FileUploader onUploadSuccess={handleUploadSuccess} />
            </TabPanel>
            <TabPanel>
              {cvData && (
                <CVEditor
                  cvData={cvData}
                  onContentUpdate={handleContentUpdate}
                  onAnalysisUpdate={handleAnalysisUpdate}
                />
              )}
            </TabPanel>
            <TabPanel>
              {cvData && (
                <ATSFeedback
                  analysis={cvData.atsAnalysis}
                  cvId={cvData.id}
                  onReanalyze={handleAnalysisUpdate}
                />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  )
}

