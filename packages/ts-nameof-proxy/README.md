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

separatedPathOf(student, (s) => s.age); // ["age"]
separatedPathOf(student, (s) => s.name.length); // ["name", "length"]
separatedPathOf<Student>((s) => s.name.length); // ["name", "length"]

pathOf(student, (s) => s.name.firstName[0]); // "['name']['firstName']['0']"
pathOf<Student>((s) => s.name.firstName[0]); // "['name']['firstName']['0']"
```

## Limitations

The example below is not feasible:

```ts
nameOf(student); // "student"
nameOf(student, (student) => student); // "student"
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
						name={pathOf(values, (values) => values[index].name.firstName)}
					/>
					<Field
						name={pathOf(values, (values) => values[index].name.lastName)}
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
