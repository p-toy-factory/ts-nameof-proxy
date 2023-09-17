# ts-nameof-proxy

`nameof` in TypeScript, no compiler required. Implemented using proxy with some limitations.

Type safely generate property name or path of variable, referenced properties can be renamed in bulk by the editor.

## Install

```
npm install ts-nameof-proxy
```

## Usage

```ts
nameOf(student, (s) => s.age); // "age"
nameOf(student, (s) => s.name.length); // "length"
nameOf<Student>((s) => s.name.length); // "length"

pathOf(student, (s) => s.age); // ["age"]
pathOf(student, (s) => s.name.length); // ["name", "length"]
pathOf<Student>((s) => s.name.length); // ["name", "length"]

pathStringOf(student, (s) => s.name.firstName[0]); // "['name']['firstName']['0']"
pathStringOf<Student>((s) => s.name.firstName[0]); // "['name']['firstName']['0']"

namesOf(student, (s) => (s.age, s.name.length)); // ["age", "length"]
namesOf<Student>((s) => (s.age, s.name.length)); // ["age", "length"]

pathsOf(student, (s) => (s.age, s.name.length)); // [["age"], ["name", "length"]]
pathsOf<Student>((s) => (s.age, s.name.length)); // [["age"], ["name", "length"]]

pathStringsOf(student, (s) => (s.name, s.name.firstName[0])); // ["['name']", "['name']['firstName']['0']"]
pathStringsOf<Student>((s) => (s.name, s.name.firstName[0])); // ["['name']", "['name']['firstName']['0']"]
```

## Limitations

The example below is NOT feasible:

```ts
nameOf(student); // ❌ Will throw error
nameOf(student, (student) => student); // ❌ Will throw error
```

## Example

```tsx
const people = [
	{ name: { firstName: "John", lastName: "Doe" } },
	{ name: { firstName: "Jane", lastName: "Smith" } },
];

<Formik initialValues={people} onSubmit={() => {}}>
	<Form>
		{({ values }) =>
			values.map((person, index) => (
				<div key={person.name.firstName}>
					<Field
						name={pathStringOf(
							values,
							(values) => values[index].name.firstName
						)}
					/>
					<Field
						name={pathStringOf(values, (values) => values[index].name.lastName)}
					/>
				</div>
			))
		}
		{/*
      <Field name="['0']['name']['firstName']" />
      <Field name="['0']['name']['lastName']" />
      <Field name="['1']['name']['firstName']" />
      <Field name="['1']['name']['lastName']" />
    */}
	</Form>
</Formik>;
```
