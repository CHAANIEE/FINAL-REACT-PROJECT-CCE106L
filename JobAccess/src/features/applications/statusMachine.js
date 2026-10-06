export const APPLICATION_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  INTERVIEW: 'interview',
  HIRED: 'hired',
  NOT_SELECTED: 'not_selected',
};

export const STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  hired: 'Hired',
  not_selected: 'Not Selected',
};

// Allowed next steps for each status
const FLOW = {
  submitted: ['under_review', 'not_selected'],
  under_review: ['shortlisted', 'not_selected'],
  shortlisted: ['interview', 'not_selected'],
  interview: ['hired', 'not_selected'],
  hired: [],
  not_selected: [],
};

export function nextStatuses(current) {
  return FLOW[current] || [];
}

export function canTransition(from, to) {
  return nextStatuses(from).includes(to);
}