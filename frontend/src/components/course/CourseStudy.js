import { useState, useEffect } from 'react'

import { useCourseContext } from "../../context/CourseContext"
import { useAuthContext } from "../../hooks/UseAuthContext"

import TopicComponent from './study/TopicComponent';
import QuestionsComponent from './study/QuestionsComponent';
import TermsComponent from './study/TermsComponent';

const CourseStudy = () => {
    
    const { user } = useAuthContext()
    const { course } = useCourseContext()
    
    const [topicList, setTopicList] = useState([])
    const [termList, setTermList] = useState([])
    const [questionList, setQuestionList] = useState([])
    const [trigger, setTrigger] = useState(false)

    const [activeForm, setActiveForm] = useState(null)

    const [topicFilter, setTopicFilter] = useState('-1')
    const [termsFiltered, setTermsFiltered] = useState()
    const [questionsFiltered, setQuestionsFiltered] = useState()

    const triggerEffect = () => { setTrigger(!trigger) }

    useEffect(() => {

        const fetchTopics = async () => {

            try {

                const response = await fetch(`/api/course/${course.courseId}/topics`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    }
                })

                const json = await response.json()
                if (json.topics) setTopicList(json.topics)

            } catch (err) {
                console.error(err)
            }

        }

        const fetchTerms = async () => {

            try {

                const response = await fetch(`/api/course/${course.courseId}/terms`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    }
                })

                const json = await response.json()
                if (json.terms) setTermList(json.terms)

            } catch (err) {
                console.error(err)
            }

        }

        const fetchQuestions = async () => {

            try {

                const response = await fetch(`/api/course/${course.courseId}/questions`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    }
                })

                const json = await response.json()
                if (json.questions) setQuestionList(json.questions)

            } catch (err) {
                console.error(err)
            }

        }

        if (user && course) {
            fetchTopics()
            fetchTerms()
            fetchQuestions()
        }

    }, [user, course, trigger])

    useEffect(() => {

        if (termList) setTermsFiltered(termList.filter(term => topicFilter === '-1' || term.topicId === parseInt(topicFilter)))

        if (questionList) setQuestionsFiltered(questionList.filter(question => topicFilter === '-1' || question.topicId === parseInt(topicFilter)))

    }, [termList, topicFilter])

    return (
        <div>
            <TopicComponent
                topics={topicList}
                setTopics={setTopicList}
                refresh={triggerEffect}
                activeForm={activeForm}
                setActiveForm={setActiveForm}
                topicFilter={topicFilter}
                setTopicFilter={setTopicFilter}
            />
            <TermsComponent
                terms={termsFiltered}
                setTerms={setTermList}
                topics={topicList}
                refresh={triggerEffect}
                activeForm={activeForm}
                setActiveForm={setActiveForm}
            />
            <QuestionsComponent
                questions={questionsFiltered}
                setQuestions={setQuestionList}
                refresh={triggerEffect}
                topics={topicList}
                activeForm={activeForm}
                setActiveForm={setActiveForm}
            />
        </div>
    )
}

export default CourseStudy
