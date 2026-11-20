/** Relationship of the driver A *with respect to* the driver B. E.g. `PARENT` means "A is a parent of B" */
export type FamilyRelationship =
  | 'CHILD'
  | 'CHILD_IN_LAW'
  | 'GRANDCHILD'
  | 'GRANDPARENT'
  /** A is a sibling of B's grandparent (great-uncle/aunt) */
  | 'GRANDPARENTS_SIBLING'
  | 'HALF_SIBLING'
  | 'PARENT'
  | 'PARENT_IN_LAW'
  /** A is a sibling of B's parent (uncle/aunt) */
  | 'PARENTS_SIBLING'
  /** A is a child of B's parent's sibling (cousin) */
  | 'PARENTS_SIBLINGS_CHILD'
  | 'SIBLING'
  | 'SIBLING_IN_LAW'
  /** A is a child of B's sibling (nephew/niece) */
  | 'SIBLINGS_CHILD'
  | 'SIBLINGS_CHILD_IN_LAW'
  | 'SIBLINGS_GRANDCHILD';

export type Gender = 'MALE' | 'FEMALE';
