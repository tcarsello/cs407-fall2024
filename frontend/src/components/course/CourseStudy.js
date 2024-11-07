import { useState, useEffect } from 'react';
import { useCourseContext } from "../../context/CourseContext";
import { useAuthContext } from "../../hooks/UseAuthContext";
import TopicComponent from './study/TopicComponent';
import QuestionsComponent from './study/QuestionsComponent';
import TermsComponent from './study/TermsComponent';
import { 
    Container, 
    Box, 
    Typography, 
    Stack,
    Paper,
    Tabs,
    Tab,
    Fade,
    Divider
} from '@mui/material';
import { Book, Bookmark, HelpCircle } from 'lucide-react';

const CourseStudy = () => {
    const { user } = useAuthContext();
    const { course } = useCourseContext();
    
    const [topicList, setTopicList] = useState([]);
    const [termList, setTermList] = useState([]);
    const [questionList, setQuestionList] = useState([]);
    const [trigger, setTrigger] = useState(false);
    const [activeForm, setActiveForm] = useState(null);
    const [topicFilter, setTopicFilter] = useState('-1');
    const [termsFiltered, setTermsFiltered] = useState();
    const [questionsFiltered, setQuestionsFiltered] = useState();
    const [activeTab, setActiveTab] = useState(0);

    const triggerEffect = () => { setTrigger(!trigger) };

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await fetch(`/api/course/${course.courseId}/topics`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    }
                });

                const json = await response.json();
                if (json.topics) setTopicList(json.topics);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchTerms = async () => {
            try {
                const response = await fetch(`/api/course/${course.courseId}/terms`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    }
                });

                const json = await response.json();
                if (json.terms) setTermList(json.terms);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchQuestions = async () => {
            try {
                const response = await fetch(`/api/course/${course.courseId}/questions`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    }
                });

                const json = await response.json();
                if (json.questions) setQuestionList(json.questions);
            } catch (err) {
                console.error(err);
            }
        };

        if (user && course) {
            fetchTopics();
            fetchTerms();
            fetchQuestions();
        }
    }, [user, course, trigger]);

    useEffect(() => {
        if (termList) {
            setTermsFiltered(termList.filter(term => 
                topicFilter === '-1' || term.topicId === parseInt(topicFilter)
            ));
        }

        if (questionList) {
            setQuestionsFiltered(questionList.filter(question => 
                topicFilter === '-1' || question.topicId === parseInt(topicFilter)
            ));
        }
    }, [termList, topicFilter, questionList]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Book size={32} color="#1976d2" />
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        Study Materials
                    </Typography>
                </Stack>
            </Box>

            {/* Main Content */}
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                {/* Topics Section (Always Visible) */}
                <Box sx={{ p: 3, bgcolor: 'background.default' }}>
                    <TopicComponent
                        topics={topicList}
                        setTopics={setTopicList}
                        refresh={triggerEffect}
                        activeForm={activeForm}
                        setActiveForm={setActiveForm}
                        topicFilter={topicFilter}
                        setTopicFilter={setTopicFilter}
                    />
                </Box>

                <Divider />

                {/* Tabs for Terms and Questions */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTab-root': {
                                minHeight: 64,
                                fontSize: '1rem'
                            }
                        }}
                    >
                        <Tab 
                            icon={<Bookmark size={20} />} 
                            label="Terms" 
                            iconPosition="start"
                        />
                        <Tab 
                            icon={<HelpCircle size={20} />} 
                            label="Questions" 
                            iconPosition="start"
                        />
                    </Tabs>
                </Box>

                {/* Terms Tab Panel */}
                <Fade in={activeTab === 0}>
                    <Box sx={{ p: 3, display: activeTab === 0 ? 'block' : 'none' }}>
                        <TermsComponent
                            terms={termsFiltered}
                            setTerms={setTermList}
                            topics={topicList}
                            refresh={triggerEffect}
                            activeForm={activeForm}
                            setActiveForm={setActiveForm}
                        />
                    </Box>
                </Fade>

                {/* Questions Tab Panel */}
                <Fade in={activeTab === 1}>
                    <Box sx={{ p: 3, display: activeTab === 1 ? 'block' : 'none' }}>
                        <QuestionsComponent
                            questions={questionsFiltered}
                            setQuestions={setQuestionList}
                            refresh={triggerEffect}
                            topics={topicList}
                            activeForm={activeForm}
                            setActiveForm={setActiveForm}
                        />
                    </Box>
                </Fade>
            </Paper>
        </Container>
    );
};

export default CourseStudy;