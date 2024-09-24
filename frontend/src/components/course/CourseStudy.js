import { useState, useEffect } from 'react';

import { useCourseContext } from "../../context/CourseContext";
import { useAuthContext } from "../../hooks/UseAuthContext";

const CourseStudy = () => {
    const { course } = useCourseContext();
    const { user } = useAuthContext();

    const [studyTerms, setStudyTerms] = useState([]);
    const [newTerm, setNewTerm] = useState({
        term: '',
        definition: '',
    });

    useEffect(() => {
        const fetchStudyTerms = async () => {
            try {
                const response = await fetch(`/api/course/${course.courseId}/study-terms`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    },
                });
                const data = await response.json();
                setStudyTerms(data.studyTerms);
            } catch (error) {
                console.error('Error fetching study terms:', error);
            }
        };

        if (course.courseId) {
            fetchStudyTerms();
        }
    }, [course.courseId]);

    const handleTermChange = (e) => {
        setNewTerm({ ...newTerm, term: e.target.value });
    };

    const handleDefinitionChange = (e) => {
        setNewTerm({ ...newTerm, definition: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/course/${course.courseId}/study-terms`, {
                method: 'POST',
                body: JSON.stringify(newTerm),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
            });
            const data = await response.json();
            setStudyTerms([...studyTerms, data.studyTerm]);
            setNewTerm({ term: '', definition: '' });
        } catch (error) {
            console.error('Error creating study term:', error);
        }
    };

    return (
        <div className="content-card">
            <h2>Study Terms</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="term">Term:</label>
                    <input
                        type="text"
                        id="term"
                        value={newTerm.term}
                        onChange={handleTermChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="definition">Definition:</label>
                    <textarea
                        id="definition"
                        value={newTerm.definition}
                        onChange={handleDefinitionChange}
                        required
                    />
                </div>
                <button type="submit">Add Term</button>
            </form>
            <ul>
                {studyTerms.map((studyTerm, index) => (
                    <li key={index}>
                        <strong>{studyTerm.term}</strong>: {studyTerm.definition}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CourseStudy;