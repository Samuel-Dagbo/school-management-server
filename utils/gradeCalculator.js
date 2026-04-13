// Grade calculation utility
// Based on standard grading scale

export const calculateGrade = (score) => {
  if (score >= 90) return { grade: 'A+', points: 4.0, remark: 'Excellent' };
  if (score >= 80) return { grade: 'A', points: 4.0, remark: 'Excellent' };
  if (score >= 75) return { grade: 'B+', points: 3.5, remark: 'Very Good' };
  if (score >= 70) return { grade: 'B', points: 3.0, remark: 'Good' };
  if (score >= 65) return { grade: 'C+', points: 2.5, remark: 'Satisfactory' };
  if (score >= 60) return { grade: 'C', points: 2.0, remark: 'Satisfactory' };
  if (score >= 55) return { grade: 'D+', points: 1.5, remark: 'Pass' };
  if (score >= 50) return { grade: 'D', points: 1.0, remark: 'Pass' };
  if (score >= 45) return { grade: 'E', points: 0.5, remark: 'Below Average' };
  return { grade: 'F', points: 0.0, remark: 'Needs Improvement' };
};

export const calculateGPA = (results) => {
  if (!results || results.length === 0) return 0;
  
  let totalPoints = 0;
  let totalSubjects = 0;
  
  for (const result of results) {
    if (result.score !== undefined) {
      const { points } = calculateGrade(result.score);
      totalPoints += points;
      totalSubjects++;
    }
  }
  
  return totalSubjects > 0 ? (totalPoints / totalSubjects).toFixed(2) : 0;
};

export const calculatePosition = (studentId, results, sortBy = 'total') => {
  if (!results || results.length === 0) return null;
  
  // Group by class
  const classScores = {};
  
  for (const result of results) {
    const classId = result.studentId?.classId?.toString();
    if (!classId) continue;
    
    if (!classScores[classId]) {
      classScores[classId] = [];
    }
    
    classScores[classId].push({
      studentId: result.studentId,
      score: result.score,
      points: calculateGrade(result.score).points
    });
  }
  
  // Calculate for each class
  const positions = {};
  
  for (const [classId, scores] of Object.entries(classScores)) {
    // Sum scores for each student
    const studentTotals = {};
    
    for (const s of scores) {
      const sid = s.studentId?.toString();
      if (!sid) continue;
      
      if (!studentTotals[sid]) {
        studentTotals[sid] = { studentId: sid, totalPoints: 0, count: 0 };
      }
      
      studentTotals[sid].totalPoints += s.points;
      studentTotals[sid].count++;
    }
    
    // Calculate average and sort
    const ranked = Object.values(studentTotals)
      .map(s => ({
        ...s,
        average: s.count > 0 ? (s.totalPoints / s.count) : 0
      }))
      .sort((a, b) => b.average - a.average);
    
    // Get position
    for (let i = 0; i < ranked.length; i++) {
      positions[ranked[i].studentId] = i + 1;
    }
  }
  
  return positions[studentId] || null;
};

export const getGradeColor = (grade) => {
  const colors = {
    'A+': 'text-green-600 bg-green-100',
    'A': 'text-green-600 bg-green-100',
    'B+': 'text-blue-600 bg-blue-100',
    'B': 'text-blue-600 bg-blue-100',
    'C+': 'text-amber-600 bg-amber-100',
    'C': 'text-amber-600 bg-amber-100',
    'D+': 'text-orange-600 bg-orange-100',
    'D': 'text-orange-600 bg-orange-100',
    'E': 'text-red-600 bg-red-100',
    'F': 'text-red-600 bg-red-100'
  };
  
  return colors[grade] || 'text-slate-600 bg-slate-100';
};

export default { calculateGrade, calculateGPA, calculatePosition, getGradeColor };