var parentDocumentId = 0;
var colleagueId = "";
var DATASET_NAME = "fdwt_empresas"

var FLUIG_DOMAIN = "<DOMINIO_DO_FLUIG>" // Insira o domínio do ambiente fluig alvo, seguindo o exemplo: http://dev2.digte.com.br:8080

function servicetask4(attempt, message) {
	log.info("@@ Inicio do servico sincroniza_empresas");
	
	try {
		// Credenciais para consumo do serviço de fichas do fluig (ECMCardService)
		// Preencher as variáveis 'fluigUsuario' e 'fluigSenha' com a identificação e a senha de um usuário com papel admin de seu ambiente fluig alvo
		// Você pode inserir as credenciais de acesso ao RP nesta sessão também
		var fluigCompanyId = getValue("WKCompany");
		var fluigUsuario = "<CODIGO_DO_USUARIO>"; // Informe aqui a identificação do usuário
		var fluigSenha = "<SENHA_DO_USUARIO>"; // Informe aqui a senha do usuário
		
		// Acesso ao RP
		// Implemente aqui o acesso ao seu RP retornando as seguintes informações:
		// 1. *empresaId: Código do empresa
		// 2. *descricao: Nome do empresa
		// *campo de preenchimento obrigatório
		// Precisamos das seguintes ações:
		// 1. Para cada empresa retornado de seu RP, preencha o objeto 'objEmpresa' com as devidas informações
		// 2. Para cada 'objEmpresa' criado, adicione o mesmo no array 'resultSet'

		var resultSet = [];

		// Inicio - Seu trecho de código para incluir as empresas no array resultSet
			var objEmpresa = {
				descricao: 'Digte',
				empresaId: '37842347'
			};

			resultSet.push(objEmpresa);
		// Fim - Seu trecho de código para incluir as empresas no array resultSet
		
		// A partir daqui não é necessário alterações no código
		for (var i = 0; i < resultSet.length; i++) {
			var objEmpresa = resultSet[i];
			var c1 = DatasetFactory.createConstraint("empresaId", objEmpresa.empresaId, objEmpresa.empresaId, ConstraintType.MUST);
			var c2 = DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST);
			var dsEmpresa = DatasetFactory.getDataset(DATASET_NAME, null, [c1, c2], null);
			
			if (dsEmpresa != null && dsEmpresa.rowsCount > 0) {
				if (needsToUpdate(objEmpresa, dsEmpresa)) {
					updateCard(dsEmpresa, objEmpresa, fluigCompanyId, fluigUsuario, fluigSenha);
				}
				else {
					continue;
				}
			}
			else {
				createCard(objEmpresa, fluigCompanyId, fluigUsuario, fluigSenha);
			}
		}

		log.info("@@ Fim do servico sincroniza_empresas");

	} catch (e) {
		log.info("@@ Erro, estourou uma excecao");
		log.info("@@ e.message: " + e.toString());
		log.info("@@ Fim do servico sincroniza_empresas");
	}
}

function needsToUpdate(objEmpresa, dsEmpresa) {
	var update = false;

	if (dsEmpresa.getValue(0, "empresaId") != objEmpresa.empresaId || 
		dsEmpresa.getValue(0, "descricao") != objEmpresa.descricao) {
			update = true;
	}

	return update;
}

function updateCard(dsEmpresa, objEmpresa, fluigCompanyId, fluigUsuario, fluigSenha) {
	var cardId = dsEmpresa.getValue(0, "metadata#Id");

	if (cardId != 0) {
		var serviceUrl = FLUIG_DOMAIN + "/webdesk/ECMCardService?wsdl"
		var javaNetUrl = new java.net.URL(serviceUrl);

		var connection = javaNetUrl.openConnection();
		connection.setDoOutput(true);
		connection.setRequestMethod("POST");
		connection.setRequestProperty("Content-Type", "text/xml; charset=utf-8");
		connection.setRequestProperty("SOAPAction", "updateCardData");
		
		var arrFields = returnFormFields(objEmpresa)

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

		log.info("@@ Atualizado empresa " + objEmpresa.empresaId + ":" + responseCode )
	}
	else {
		return false;
	}
}

function createCard (objEmpresa, fluigCompanyId, fluigUsuario, fluigSenha) {
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
	
	var arrFields = returnFormFields(objEmpresa)

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
						postData.append('<documentDescription>' + objEmpresa.descricao + '</documentDescription>');
                    postData.append('</item>');
                postData.append('</card>');
        postData.append('</ws:createCard>');
        postData.append('</soapenv:Body>');
	postData.append('</soapenv:Envelope>');
	
	var os = connection.getOutputStream();
    os.write(postData.toString().getBytes());
	os.flush();
	
	var responseCode = connection.getResponseCode();

	log.info("@@ Criado empresa " + objEmpresa.empresaId + ":" + responseCode )
}

function returnFormFields(objEmpresa) {    
    var arrFields = [];
    var arrColumns = ["empresaId", "descricao"];
    
    for (var i = 0; i < arrColumns.length; i++) {
        var fieldObj = {
            fieldName: arrColumns[i],
            fieldValue: objEmpresa[arrColumns[i]]
        };
        
        arrFields.push(fieldObj);
    }
    
    return arrFields;
}