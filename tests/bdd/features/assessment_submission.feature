Feature: Student assessment submission and AI feedback

  As a teacher
  I want to submit a student assignment for AI assessment
  So that I receive detailed, actionable feedback

  Scenario: Submit a text assignment and receive AI feedback
    Given I am on the "Upload Student Submissions" page
    When I enter a task description
    And I enter a student submission
    And I submit the assessment form
    Then I should be redirected to the "Assessment Results" page
    And I should see the AI-generated grade
    And I should see strengths, areas for improvement, and individualized activity
    And I should see a reflection question and teacher suggestion
    And I should see spelling and grammar feedback
    And I should be able to expand to view AI reasoning

  Scenario: Submit an invalid or empty submission
    Given I am on the "Upload Student Submissions" page
    When I leave the submission field empty
    Then the submit button should be disabled
