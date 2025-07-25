// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DisciplinaHome(props: any) {
  const { params } = props;

  return (
    <h1 className="text-2xl font-semibold">
      Página da disciplina: {params.slug.toUpperCase()}
    </h1>
  );
}