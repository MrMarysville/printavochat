# taskCreate

Create a task

## Input fields

### input (`TaskCreateInput!`)
Create task values

## Return fields

### assignedTo (`User`)
Who the task is assigned to

### completed (`Boolean!`)
Is the task complete?

### completedAt (`ISO8601DateTime`)
When was it last completed

### completedBy (`User`)
Who completed the task

### dueAt (`ISO8601DateTime!`)
When is the task due

### id (`ID!`)
The ID

### name (`String!`)
The task name

### sourcePresetTaskGroupTitle (`String`)
The title of the task group this was created from

### taskable (`TaskableUnion`)
Object this is attached to, if any

### timestamps (`ObjectTimestamps!`)
Object timestamps
