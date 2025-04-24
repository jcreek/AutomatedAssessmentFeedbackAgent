Feature: Assessment history management

  As a teacher
  I want to view and manage the history of assessed submissions
  So that I can review or remove past feedback

  Scenario: View assessment history
    Given I have previously submitted assessments
    When I visit the "Assessment Results" page
    Then I should see a table of past assessments with date, task, and grade
    And I should be able to expand an entry to see detailed feedback

  @deleteAssessment
  Scenario: Delete an assessment from history
    Given I have previously submitted assessments
    When I delete an assessment from history
    Then that assessment should be removed from the history

  @clearAssessment
  Scenario: Clear all assessment history
    Given I have previously submitted assessments
    When I clear all assessment history
    Then all assessments should be removed from the history
