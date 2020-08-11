var parentDocumentId = 0;
var colleagueId = "";
var DATASET_NAME = "fdwt_estrutura_empresa"

var FLUIG_DOMAIN = "<DOMINIO_DO_FLUIG>" // Insira o domínio do ambiente fluig alvo, seguindo o exemplo: http://dev2.digte.com.br:8080

function servicetask4(attempt, message) {
	log.info("@@ Inicio do servico sincroniza_cargos");
	
	try {
		// Credenciais para consumo do serviço de fichas do fluig (ECMCardService)
		// Preencher as variáveis 'fluigUsuario' e 'fluigSenha' com a identificação e a senha de um usuário com papel admin de seu ambiente fluig alvo
		// Você pode inserir as credenciais de acesso ao RP nesta sessão também
		var fluigCompanyId = getValue("WKCompany");
		var fluigUsuario = "<CODIGO_DO_USUARIO>"; // Informe aqui a identificação do usuário
		var fluigSenha = "<SENHA_DO_USUARIO>"; // Informe aqui a senha do usuário
		
		// Acesso ao RP
		// Implemente aqui o acesso ao seu RP retornando as seguintes informações:
        // 1. estruturaCargo: código do departamento do responsável pelo departamento
        // 2. estruturaDepartamento: nome completo do responsável pelo departamento
        // 3. estruturaDepartamentoMatricula: matrícula do fluig do responsável pelo departamento
        // 4. estruturaDivisao: código do departamento ao qual este departamento é subordinado
        // 5. *estruturaId: código do departamento
        // 6. estruturaLogin: login do fluig do responsável pelo departamento
        // 7. *estruturaNome: nome do departamento
        // *campo de preenchimento obrigatório
		// Precisamos das seguintes ações:
		// 1. Para cada departamento retornado de seu RP, preencha o objeto 'objDepartamento' com as devidas informações
		// 2. Para cada 'objDepartamento' criado, adicione o mesmo no array 'resultSet'

		var resultSet = [];

		// Inicio - Seu trecho de código para incluir os departamentos no array resultSet
			var objDepartamento = {
				estruturaCargo: '1823719283',
                estruturaDepartamento: 'João de Deus da Silva',
                estruturaDepartamentoMatricula: 'joao.deus.silva',
                estruturaDivisao: '7654',
                estruturaId: '7658',
                estruturaLogin: 'joao.deus.silva.1',
                estruturaNome: 'Suporte 1',
			};

			resultSet.push(objDepartamento);
		// Fim - Seu trecho de código para incluir os departamentos no array resultSet

		// A partir daqui não é necessário alterações no código
		for (var i = 0; i < resultSet.length; i++) {
			var objDepartamento = resultSet[i];
			var c1 = DatasetFactory.createConstraint("estruturaId", objDepartamento.estruturaId, objDepartamento.estruturaId, ConstraintType.MUST);
			var c2 = DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST);
			var dsDepartamento = DatasetFactory.getDataset(DATASET_NAME, null, [c1, c2], null);
			
			if (dsDepartamento != null && dsDepartamento.rowsCount > 0) {
				if (needsToUpdate(objDepartamento, dsDepartamento)) {
					updateCard(dsDepartamento, objDepartamento, fluigCompanyId, fluigUsuario, fluigSenha);
				}
				else {
					continue;
				}
			}
			else {
				createCard(objDepartamento, fluigCompanyId, fluigUsuario, fluigSenha);
			}
		}

		log.info("@@ Fim do servico sincroniza_cargos");

	} catch (e) {
		log.info("@@ Erro, estourou uma excecao");
		log.info("@@ e.message: " + e.toString());
		log.info("@@ Fim do servico sincroniza_cargos");
	}
}

function needsToUpdate(objDepartamento, dsDepartamento) {
	var update = false;

    if (dsDepartamento.getValue(0, "estruturaCargo") != objDepartamento.estruturaCargo ||
        dsDepartamento.getValue(0, "estruturaDepartamento") != objDepartamento.estruturaDepartamento ||
        dsDepartamento.getValue(0, "estruturaDepartamentoMatricula") != objDepartamento.estruturaDepartamentoMatricula ||
        dsDepartamento.getValue(0, "estruturaDivisao") != objDepartamento.estruturaDivisao ||
        dsDepartamento.getValue(0, "estruturaId") != objDepartamento.estruturaId ||
        dsDepartamento.getValue(0, "estruturaLogin") != objDepartamento.estruturaLogin ||
        dsDepartamento.getValue(0, "estruturaNome") != objDepartamento.estruturaNome) {
            update = true;
    }

	return update;
}

function updateCard(dsDepartamento, objDepartamento, fluigCompanyId, fluigUsuario, fluigSenha) {
	var cardId = dsDepartamento.getValue(0, "metadata#Id");

	if (cardId != 0) {
		var serviceUrl = FLUIG_DOMAIN + "/webdesk/ECMCardService?wsdl"
		var javaNetUrl = new java.net.URL(serviceUrl);

		var connection = javaNetUrl.openConnection();
		connection.setDoOutput(true);
		connection.setRequestMethod("POST");
		connection.setRequestProperty("Content-Type", "text/xml; charset=utf-8");
		connection.setRequestProperty("SOAPAction", "updateCardData");
		
		var arrFields = returnFormFields(objDepartamento)

		var postData = new java.lang.StringBuilder();
		postData.append('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.dm.ecm.technology.totvs.com/">');
			postData.append('<soapenv:Header/>');
			postData.append('<soapenv:Body>');
				postData.append('<ws:updateCardData>');
					postData.append('<companyId>' + fluigCompanyId + '</companyId>');
					postData.append('<username>' + fluigUsuario + '</username>');
					postData.append('<password>' + fluigSenha + '</password>');
					postData.append('<cardId>' + cardId + '</cardId>');
					postData.append('<cardData>');
					for (var i = 0; i < arrFields.length; i++) {
						postData.append('<item>');
							postData.append('<field>' + arrFields[i].fieldName + '</field>');
							postData.append('<value name="' + arrFields[i].fieldName + '">' + arrFields[i].fieldValue + '</value>');
						postData.append('</item>');
					}
					postData.append('</cardData>');
				postData.append('</ws:updateCardData>');
			postData.append('</soapenv:Body>');
		postData.append('</soapenv:Envelope>');

		var os = connection.getOutputStream();
		os.write(postData.toString().getBytes());
		os.flush();
		
		var responseCode = connection.getResponseCode();

		log.info("@@ Atualizado departamento " + objDepartamento.estruturaId + ":" + responseCode )
	}
	else {
		return false;
	}
}

function createCard (objDepartamento, fluigCompanyId, fluigUsuario, fluigSenha) {
    if (parentDocumentId == 0) {
		var c1 = DatasetFactory.createConstraint("datasetName", DATASET_NAME, DATASET_NAME, ConstraintType.MUST);
		var c2 = DatasetFactory.createConstraint("activeVersion", true, true, ConstraintType.MUST);
		var dsDocument = DatasetFactory.getDataset("document", null, [c1, c2], null);

		if (dsDocument != null && dsDocument.rowsCount > 0) {
			parentDocumentId = dsDocument.getValue(0, "documentPK.documentId");
			colleagueId = dsDocument.getValue(0, "colleagueId");
		}
    }
    
	var serviceUrl = FLUIG_DOMAIN + "/webdesk/ECMCardService?wsdl"
	var javaNetUrl = new java.net.URL(serviceUrl);

	var connection = javaNetUrl.openConnection();
    connection.setDoOutput(true);
    connection.setRequestMethod("POST");
    connection.setRequestProperty("Content-Type", "text/xml; charset=utf-8");
	connection.setRequestProperty("SOAPAction", "createCard");
	
	var arrFields = returnFormFields(objDepartamento)

	var postData = new java.lang.StringBuilder();
    postData.append('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.dm.ecm.technology.totvs.com/">');
        postData.append('<soapenv:Header/>');
        postData.append('<soapenv:Body>');
            postData.append('<ws:createCard>');
                postData.append('<companyId>' + fluigCompanyId + '</companyId>');
                postData.append('<username>' + fluigUsuario + '</username>');
                postData.append('<password>' + fluigSenha + '</password>');
                postData.append('<card>');
                    postData.append('<item>');
                    for (var i = 0; i < arrFields.length; i++) {
                        postData.append('<cardData>');
                            postData.append('<field>' + arrFields[i].fieldName + '</field>');
                            postData.append('<value name="' + arrFields[i].fieldName + '">' + arrFields[i].fieldValue + '</value>');
                        postData.append('</cardData>');
                    }
						postData.append('<parentDocumentId>' + parentDocumentId + '</parentDocumentId>');
						postData.append('<documentDescription>' + objDepartamento.cargoNome + '</documentDescription>');
                    postData.append('</item>');
                postData.append('</card>');
        postData.append('</ws:createCard>');
        postData.append('</soapenv:Body>');
	postData.append('</soapenv:Envelope>');
	
	var os = connection.getOutputStream();
    os.write(postData.toString().getBytes());
	os.flush();
	
	var responseCode = connection.getResponseCode();

	log.info("@@ Criado departamento " + objDepartamento.estruturaId + ":" + responseCode )
}

function returnFormFields(objDepartamento) {    
    var arrFields = [];
    var arrColumns = ["estruturaCargo", "estruturaDepartamento", "estruturaDepartamentoMatricula", "estruturaDivisao", "estruturaId", "estruturaLogin", "estruturaNome"];
    
    for (var i = 0; i < arrColumns.length; i++) {
        var fieldObj = {
            fieldName: arrColumns[i],
            fieldValue: objDepartamento[arrColumns[i]]
        };
        
        arrFields.push(fieldObj);
    }
    
    return arrFields;
}